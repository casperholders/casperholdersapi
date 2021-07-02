var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var balanceRouter = require('./routes/balance');
var delegateRouter = require('./routes/delegate');
var undelegateRouter = require('./routes/undelegate');
var transferRouter = require('./routes/transfer');
var deployRouter = require('./routes/deploy');

var app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200
}))

app.use(logger('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/balance', balanceRouter);
app.use('/delegate', delegateRouter);
app.use('/undelegate', undelegateRouter);
app.use('/transfer', transferRouter);
app.use('/deploy', deployRouter);

module.exports = app;
