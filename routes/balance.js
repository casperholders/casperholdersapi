const express = require('express');
const {CLPublicKey, CasperClient, CasperServiceByJsonRPC} = require("casper-js-sdk");
const router = express.Router();
const client = new CasperClient(process.env.CASPER_RPC_URL)
let rpcclient = new CasperServiceByJsonRPC(process.env.CASPER_RPC_URL);

router.get('/:publicKey', function (req, res) {
    try {
        client.balanceOfByPublicKey(CLPublicKey.fromHex(req.params.publicKey)).then((result) => {
            res.send({balance: result.toString()});
        }).catch(err => res.send(err))
    } catch (err) {
        res.send(err)
    }
});

router.get('/stake/:publicKey', function (req, res) {
    try {
        rpcclient.getValidatorsInfo().then(result => {
            let validator = result.auction_state.bids.filter(validator => {
                return validator.public_key === "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca"
            })[0]

            let stakingBalance = validator.bid.delegators.filter(delegator => {
                return delegator.public_key === req.params.publicKey
            })
            if (stakingBalance.length > 0) {
                stakingBalance = stakingBalance[0].staked_amount
                res.send({balance: stakingBalance})
            }else{
                res.send({
                    balance: 0,
                    error: "This account doesn't stake any CSPR on this Validator."
                })
            }
        }).catch(err => res.send(err))
    } catch (err) {
        console.log(err)
        res.send(err)
    }
});

module.exports = router;
