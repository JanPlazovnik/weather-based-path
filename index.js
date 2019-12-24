const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const conf = require('./utils/conf.js');
const funcs = require('./utils/funcs.js');
const port = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const api = express.Router();
app.use('/api/v1/locations', api);

api.post('/path', (req, res) => {
    let locations = (req.body.locations) ? req.body.locations : [req.body.origin, req.body.end];
    console.log(locations);
    res.sendStatus(200);
});

// catch-all routes
app.get('*', (req, res) => res.sendStatus(404));
app.post('*', (req, res) => res.sendStatus(404));

app.listen(port, () => console.log(`Listening on port ${port}`));