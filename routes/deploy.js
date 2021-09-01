const express = require('express');
const {Counter} = require("prom-client");
const {CasperClient} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)
const types = ["transfer", "smart_contract", "add_bid", "withdraw_bid", "delegate", "undelegate"]

const operationsCounter = new Counter({
    name: 'casperholders_operations',
    help: 'Count operations',
    labelNames: ['type'],
});

router.get('/result/:deployHash', function (req, res, next) {
    if (process.env.OVERRIDE_API_ENDPOINTS === "true") {
        fetch(process.env.OVERRIDE_API_URL+"/deploy/result/" + req.params.deployHash).then((response) => {
            res.send().status(response.status)
        }).catch((e) => {
            console.log(e);
            res.send(e);
        })
    } else {
        client.getDeploy(req.params.deployHash).then((result) => {
            let deployResult = result[1].execution_results
            const session = result[1].deploy.session

            let type = "";

            if ("Transfer" in session) {
                type = "transfer"
            }

            if ("StoredContractByHash" in session) {
                type = result[1].deploy.session.StoredContractByHash.entry_point
            }

            if ("ModuleBytes" in session) {
                type = "smart_contract"
            }
            if (deployResult.length > 0 && type != null && types.includes(type)) {
                deployResult = deployResult[0].result;
                if ("Success" in deployResult) {
                    operationsCounter.inc({type: type})
                    res.send().status(204)
                } else if ("Failure" in deployResult) {
                    type = type + "_error"
                    operationsCounter.inc({type: type})
                    res.send().status(204)
                } else {
                    res.sendStatus(404)
                }
            } else {
                res.sendStatus(404)
            }
        }).catch((e) => {
            console.log(e);
            res.send(e);
        })
    }
})

module.exports = router;
