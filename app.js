let express = require('express');
let cors = require('cors')
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let balanceRouter = require('./routes/balance');
let delegateRouter = require('./routes/delegate');
let undelegateRouter = require('./routes/undelegate');
let transferRouter = require('./routes/transfer');
let deployRouter = require('./routes/deploy');
let addBidRouter = require('./routes/addBid');

let app = express();

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
app.use('/addbid', addBidRouter);

module.exports = app;
