var express = require('express');
const {DeployUtil} = require("casper-client-sdk");
const {CasperClient} = require("casper-client-sdk");
var router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)
/* GET users listing. */
router.post('/', function (req, res, next) {
    try {
        DeployUtil.validateDeploy(DeployUtil.deployFromJson(req.body.deploy))
        client.putDeploy(DeployUtil.deployFromJson(req.body.deploy)).then((result) => {
            console.log(result)
            res.send({deploy_hash: result});
        }).catch(err => {
            console.log(err)
            res.send(err)
        })
    } catch (err) {
        console.log(err)
        res.send(err)
    }
});

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
