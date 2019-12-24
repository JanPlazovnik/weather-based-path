const axios = require('axios');
const conf = require('./conf.js');
const turf = require('@turf/turf');

const fetchWeatherOnCoordinate = (coords) => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${conf.weather_api_key})`);
}

exports.fetchRoutes = (_locations) => {
    return new Promise(async (resolve, reject) => {
        let locations = _locations;
        if(locations.length <= 1)
            return reject(`Expected 2 or more locations, received ${locations.length}`);
        else if(locations.length == 2) {
            let response = await axios(`https://maps.googleapis.com/maps/api/directions/json?origin=${locations[0]}&destination=${locations[1]}&alternatives=true&key=${conf.api_key}`);
            // resolve(response.data);
            let routePoints = [];

            for(const route of response.data.routes) {
                let coordinates = [];

                for(const loc of route.legs[0].steps) {
                    coordinates.push([loc.end_location.lat, loc.end_location.lng]);
                }

                let line = turf.lineString(coordinates);
                // let length = turf.length(line);
                let length = route.legs[0].distance.value / 1000;
                let parts = length / 5;

                let newLocations = [];

                for(let i = 0; i <= length; i = i + parts ) {
                    newLocations.push({
                        lat: turf.along(line, i, {units: 'kilometers'}).geometry.coordinates[0],
                        lon: turf.along(line, i, {units: 'kilometers'}).geometry.coordinates[1],
                    });
                }

                routePoints.push(newLocations);
                // console.log(newLocations);
            }
            resolve(routePoints);
        }
    });
}

return module.exports;
