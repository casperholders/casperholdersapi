let express = require("express");
let cors = require("cors");
let path = require("path");
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let logger = require("morgan");
let validatorsRouter = require("./routes/validator").router;
let apyRouter = require("./routes/apy");
let deploysRouter = require("./routes/deploys");

let app = express();

app.use(cors({
    origin: process.env.ORIGIN.split(","),
    optionsSuccessStatus: 200,
}));

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/validators", validatorsRouter);
app.use("/apy", apyRouter);
app.use("/deploys", deploysRouter);


module.exports = app;
