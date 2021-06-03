var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var balanceRouter = require('./routes/balance');
var delegateRouter = require('./routes/delegate');

var app = express();

app.use(cors({
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
}))

app.use(logger('dev'));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/balance', balanceRouter);
app.use('/delegate', delegateRouter);

module.exports = app;
