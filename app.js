let express = require('express');
let cors = require('cors')
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let deployRouter = require('./routes/deploy');
const { register } = require("prom-client");

let app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200
}))

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/deploy', deployRouter);
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});


module.exports = app;
