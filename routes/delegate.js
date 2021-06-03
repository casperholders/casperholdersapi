var express = require('express');
const {CLValue} = require("casper-client-sdk");
const {RuntimeArgs} = require("casper-client-sdk");
const {DeployUtil} = require("casper-client-sdk");
const {Contracts} = require("casper-client-sdk");
const {PublicKey} = require("casper-client-sdk");
const {CasperClient} = require("casper-client-sdk");
var router = express.Router();
const client = new CasperClient("http://157.90.149.7:7777/rpc")
/* GET users listing. */
router.post('/', function (req, res, next) {
    try {
        client.putDeploy(DeployUtil.deployFromJson(req.body.deploy)).then((result) => {
            console.log(result)
            res.send({deploy_hash: result});
        }).catch(err => res.send(err))
    } catch (err) {
        res.send(err)
    }
});

router.post('/prepare', function (req,res,next){
    let delegateContract = new Contracts.Contract(__dirname + "/delegate.wasm");
    console.log(req.body.from);
    let publicKey = PublicKey.fromHex(req.body.from);
    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(delegateContract.sessionWasm, RuntimeArgs.fromMap({
        delegator: CLValue.publicKey(publicKey),
        amount: CLValue.u512(req.body.amount+"000000000"),
        validator: CLValue.publicKey(PublicKey.fromHex("0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca"))
    }));
    const paymentArgs = RuntimeArgs.fromMap({
        amount: CLValue.u512("3000000000")
    });

    const payment = DeployUtil.ExecutableDeployItem.newModuleBytes(
        delegateContract.paymentWasm,
        paymentArgs
    );

    const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(publicKey, "casper-test"),
        session,
        payment
    );
    res.send(DeployUtil.deployToJson(deploy))
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
