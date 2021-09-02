const express = require('express');
const {Counter} = require("prom-client");
const {CasperClient} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)

/**
 * Supported types of operations on Casper Holders
 * @type {string[]}
 */
const types = ["transfer", "smart_contract", "add_bid", "withdraw_bid", "delegate", "undelegate"]

/**
 * Prometheus counter
 * @type {Counter<string>}
 */
const operationsCounter = new Counter({
    name: 'casperholders_operations',
    help: 'Count operations',
    labelNames: ['type'],
});

/**
 * @swagger
 * /deploy/result/{deployHash}:
 *  get:
 *    parameters:
 *    - in: path
 *      name: deployHash
 *      schema:
 *        type: string
 *      required: true
 *    description: Send deploy hash from CasperHolders Website to be counted in the prometheus counter metric
 *    responses:
 *      '204':
 *        description: Return nothing. The counter is automatically incremented.
 *      '404':
 *        description: If the deploy doesn't have a result or isn't a supported type or casper client crash or override api isn't reachable it returns a 404
 */
router.get('/result/:deployHash', function (req, res, next) {
    if (process.env.OVERRIDE_API_ENDPOINTS === "true") {
        fetch(process.env.OVERRIDE_API_URL+"/deploy/result/" + req.params.deployHash).then((response) => {
            res.sendStatus(response.status)
        }).catch((e) => {
            console.log(e);
            res.sendStatus(404);
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
                    res.sendStatus(204)
                } else if ("Failure" in deployResult) {
                    type = type + "_error"
                    operationsCounter.inc({type: type})
                    res.sendStatus(204);
                } else {
                    res.sendStatus(404);
                }
            } else {
                res.sendStatus(404);
            }
        }).catch((e) => {
            console.log(e);
            res.sendStatus(404);
        })
    }
})

module.exports = router;
