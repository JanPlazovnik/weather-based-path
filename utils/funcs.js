const axios = require('axios');
const conf = require('./conf.js');
const turf = require('@turf/turf');

const fetchWeatherOnCoordinate = async (coords) => {
    let response = await axios(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&units=metric&appid=${conf.weather_api_key}`);
    return [response.data.main.temp, response.data.weather[0].main];
}

const findBestPath = (arr) => {
    let bestPath = [];
    let bestTemp = 0;
    let bestCoords = {};
    let optimalTemp = 21; // might be a good optimal temperature for driving, not sure, easy change though
    for(const i in arr[0]) {
        for(const j in arr) {
            if(typeof arr[j][i].weather === 'undefined') {console.log("breaking"); break;}
            if(j == 0 || difference(optimalTemp, arr[j][i].weather.temp) < bestTemp) {
                bestTemp = difference(optimalTemp, arr[j][i].weather.temp);
                bestCoords = arr[j][i];
            }
        }
        bestPath.push(bestCoords);
        bestTemp = 0;
        bestCoords = {};
    }
    return bestPath;
}

const difference = (num1, num2) => (num1 > num2) ? num1 - num2 : num1 + num2;

const getLocations = async (locations, start = true) => {
    let response = await axios(`https://maps.googleapis.com/maps/api/directions/json?origin=${locations[0]}&destination=${locations[1]}&alternatives=true&key=${conf.api_key}`);
    let routePoints = [];

    for(const route of response.data.routes) {
        let coordinates = [];

        for(const loc of route.legs[0].steps) {
            coordinates.push([loc.end_location.lat, loc.end_location.lng]);
        }

        let line = turf.lineString(coordinates);
        let length = turf.length(line);       
        // let length = route.legs[0].distance.value / 1000;
        let parts = length / 5;
        let newLocations = [];

        for(let i = 0; i <= length; i = i + parts ) {
            // console.log(`${start} - Current length: ${i} of ${length}`);
            let point = turf.along(line, (start) ? i : i + parts , {units: 'kilometers'}).geometry.coordinates;
            try {
                let weatherAtPoint = await fetchWeatherOnCoordinate(point);
                newLocations.push({
                    lat: point[0],
                    lon: point[1],
                    weather: {
                        temp: weatherAtPoint[0],
                        type: weatherAtPoint[1]
                    }
                });
            } catch(e) {
                throw e;
            }
        }
        // console.log(newLocations);
        routePoints.push(newLocations);
    }
    let bestPath = findBestPath(routePoints);
    return bestPath;
}

exports.fetchRoutes = (_locations) => {
    return new Promise(async (resolve, reject) => {
        let locations = _locations;
        if(locations.length <= 1)
            return reject(`Expected 2 or more locations, received ${locations.length}`);
        else if(locations.length == 2) {
            try {
                resolve(getLocations(locations));
            } catch(e) {
                reject(e);
            }
        }
        else {
            try {
                let listOfAllLocations = [];
                for(let i = 0, j = 1; i < locations.length - 1; i++, j++) {
                    // if(i == 0)
                        listOfAllLocations.push(...await getLocations([locations[i], locations[j]]));
                    // else
                        // listOfAllLocations.push(...await getLocations([locations[i], locations[j]], false));
                }
                resolve(listOfAllLocations);
            } catch(e) {
                console.log(e);
                reject(e);
            }
        }
    });
}

return module.exports;
