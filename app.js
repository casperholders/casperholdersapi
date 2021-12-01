let express = require('express');
let cors = require('cors')
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let validatorsRouter = require('./routes/validator').router;
let apyRouter = require('./routes/apy');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

let app = express();

app.use(cors({
    origin: process.env.ORIGIN.split(","),
    optionsSuccessStatus: 200
}))
if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
app.use(logger('dev'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/validators', validatorsRouter);
app.use('/apy', apyRouter);


module.exports = app;
