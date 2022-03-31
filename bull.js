let express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { ClientCasper } = require('@casperholders/core');
const client = new ClientCasper(process.env.CASPER_RPC_URL);
const { Queue, Worker, QueueScheduler } = require("bullmq");
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const models = require("./models");
const parse = require("parse-duration");

let app = express();

app.use(cors({
    origin: process.env.ORIGIN.split(","),
    optionsSuccessStatus: 200,
}));

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if(process.env.DISABLE_REDIS !== 'true'){
    async function cleanDatabase() {
        const parse = require("parse-duration");
        const models = require("./models");
        const deploys = await models.Deploy.findAll();
        const deploysToDelete = [];
        for (let i = 0; i < deploys.length; i++) {
            const deploy = deploys[i].deploy.deploy;
            const ttl = parse(deploy.header.ttl);
            const timestamp = Date.parse(deploy.header.timestamp);
            const now = Date.now();
            if (now >= ttl + timestamp) {
                deploysToDelete.push(deploy.hash);
                console.log(`Deploy expired ${deploy.hash}`);
            } else {
                try {
                    await client.casperRPC.getDeployInfo(deploy.hash);
                    deploysToDelete.push(deploy.hash);
                } catch (e) {
                    console.log(`Deploy ${deploy.hash} not sent and not expired. Timestamp : ${deploy.header.timestamp}. TTL : ${deploy.header.ttl}`);
                }
            }
        }
        console.log(`Those deploys will be destroyed : ${JSON.stringify(deploysToDelete)}`);
        await models.Deploy.destroy({
            where: {
                hash: deploysToDelete,
            },
        });
    }

    const myQueueScheduler = new QueueScheduler("DatabaseCleanup", {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || "6379",
        },
    });
    const queue = new Queue("DatabaseCleanup", {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || "6379",
        },
    });

    const worker = new Worker("DatabaseCleanup", async job => {
        if (job.name === "cleanup") {
            await cleanDatabase();
        }
    }, {
        connection: {
            host: process.env.REDIS_HOST || "localhost",
            port: process.env.REDIS_PORT || "6379",
        },
    });

    queue.add(
        "cleanup",
        {},
        {
            repeat: {
                cron: "0 0 * * * *",
            },
            removeOnComplete: {
                age: 604800,
                count: 200
            },
            removeOnFail: {
                age: 604800,
                count: 200
            }
        },
    );


    const serverAdapter = new ExpressAdapter();

    const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
        queues: [
            new BullMQAdapter(queue),
        ],
        serverAdapter: serverAdapter,
    });

    serverAdapter.setBasePath('/admin/queues')
    app.use('/admin/queues', serverAdapter.getRouter());
}

module.exports = app;
