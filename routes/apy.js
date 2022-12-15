const express = require('express');
const { Big } = require('big.js');
const { ClientCasper } = require('@casperholders/core');
const router = express.Router();
const client = new ClientCasper(process.env.CASPER_RPC_URL);

let apy;
let lastBlockKnown;

/**
 * Update the validatorsData object with the account info metadata from the blockchain.
 * @returns {Promise<number>}
 */
async function getAPY() {
  const lastBlock = (await (await fetch(`${process.env.DATA_API}/blocks?limit=1&order=timestamp.desc`)).json())[0].hash;
  if (lastBlock !== lastBlockKnown || apy === undefined) {
    let totalStake = Big(0);
    let supply = getSupply();
    const validatorsInfo = (await client.casperRPC.getValidatorsInfo()).auction_state.bids;
    for (const validatorInfo of validatorsInfo) {
      if (!validatorInfo.bid.inactive) {
        if (validatorInfo.bid.delegators.length > 0) {
          totalStake = totalStake.plus(validatorInfo.bid.delegators.reduce((prev, next) => {
            return { staked_amount: Big(prev.staked_amount).plus(next.staked_amount).toString() };
          }).staked_amount);
        }
        totalStake = Big(totalStake).plus(validatorInfo.bid.staked_amount);
      }
    }
    supply = await supply;
    apy = Big(Big(Big(supply).times(Big("0.08"))).div(totalStake)).times(100).toFixed(2);
  }
}

async function getSupply() {
  const cclient = new ClientCasper(process.env.CASPER_RPC_URL);
  const stateRootHash = await cclient.casperRPC.getStateRootHash();
  const testnetUref = 'uref-5d7b1b23197cda53dec593caf30836a5740afa2279b356fae74bf1bdc2b2e725-007';
  const mainnetUref = 'uref-8032100a1dcc56acf84d5fc9c968ce8caa5f2835ed665a2ae2186141e9946214-007';
  const uref = process.env.NETWORK === 'casper' ? mainnetUref : testnetUref;
  const supply = await (await fetch(process.env.CASPER_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'jsonrpc': '2.0',
      'id': 1,
      'method': 'state_get_item',
      'params': [
        stateRootHash,
        uref
      ],
    }),
  })).json();
  return supply.result.stored_value.CLValue.parsed;
}

/**
 * @swagger
 *  definitions:
 *      APY:
 *        type: number
 * /apy/current:
 *  get:
 *    description: Return current APY
 *    responses:
 *      '503':
 *        description: No server available
 *      '200':
 *        description: Current APY
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/APY'
 */

router.get('/current', async function(req, res, next) {
  getAPY();
  if (apy !== undefined){
    res.send(apy);
  } else {
    res.sendStatus(503)
  }
});

router.get('/supply', async function(req, res, next) {
  try {
    res.send(await getSupply());
  } catch (e) {
    res.sendStatus(503);
  }
});

module.exports = { router, getAPY };
