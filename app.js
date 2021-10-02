let express = require('express');
let cors = require('cors')
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let deployRouter = require('./routes/deploy');
let operationRouter = require('./routes/operation');
let validatorsRouter = require('./routes/validator').router;
const {register} = require("prom-client");
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

app.use('/operations', operationRouter);
app.use('/deploy', deployRouter);
app.use('/validators', validatorsRouter);
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});


module.exports = app;
