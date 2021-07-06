const express = require('express');
const {CasperClient, DeployUtil, Contracts, CLPublicKey, RuntimeArgs, CLU512} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)

router.post('/', function (req, res) {
    try {
        client.putDeploy(DeployUtil.deployFromJson(req.body.deploy)).then((result) => {
            console.log(result)
            res.send({deploy_hash: result});
        }).catch(err => res.send(err))
    } catch (err) {
        res.send(err)
    }
});

router.post('/prepare', function (req,res){
    let delegateContract = new Contracts.Contract(__dirname + "/../contracts/delegate.wasm");
    console.log(req.body.from);
    let publicKey = CLPublicKey.fromHex(req.body.from);
    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(delegateContract.sessionWasm, RuntimeArgs.fromMap({
        delegator: publicKey,
        amount: new CLU512(req.body.amount*1000000000),
        validator: CLPublicKey.fromHex("0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca")
    }));
    const paymentArgs = RuntimeArgs.fromMap({
        amount: new CLU512("3000000000")
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

module.exports = router;
