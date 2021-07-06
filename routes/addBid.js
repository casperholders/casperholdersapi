const express = require('express');
const {CasperClient, DeployUtil} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)

router.post('/', function (req, res) {
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

module.exports = router;
