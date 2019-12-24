const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const funcs = require('./utils/funcs.js');
const port = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const api = express.Router();
app.use('/api/v1/locations', api);

api.post('/path', (req, res) => {
    if(!req.body.locations)
        return res.sendStatus(500);
    const locations = req.body.locations; // always send location objects in an array, even if it's just the origin and end
    funcs
        .fetchRoutes(locations)
        .then((response) => res.status(200).json(response))
        .catch((err) => res.status(500).json(err));
});

// catch-all routes
app.get('*', (req, res) => res.sendStatus(404));
app.post('*', (req, res) => res.sendStatus(404));

app.listen(port, () => console.log(`Listening on port ${port}`));