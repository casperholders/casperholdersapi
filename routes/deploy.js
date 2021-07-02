const express = require('express');
const {CasperClient} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)

router.get('/result/:deployHash', function (req,res,next){
    client.getDeploy(req.params.deployHash).then((result) => {
        let deployResult = result[1].execution_results
        if(deployResult.length > 0){
            deployResult = deployResult[0].result;
        }
        let cost = 0;
        let status = "Unknown";
        let message = "";
        if("Success" in deployResult){
            cost = deployResult.Success.cost
            status = true
        }
        if("Failure" in deployResult){
            cost = deployResult.Failure.cost
            status = false
            message = deployResult.Failure.error_message
        }
        res.send({
            status: status,
            cost: cost,
            message: message
        });
    }).catch(err => res.send(err))
})

module.exports = router;
