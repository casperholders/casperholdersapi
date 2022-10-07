const express = require('express');
const { Big } = require('big.js');
const { ClientCasper } = require('@casperholders/core');
const router = express.Router();
const client = new ClientCasper(process.env.CASPER_RPC_URL);

/**
 * Last ERA
 * @type Number
 */
let lastEra;

/**
 * Last APY
 * @type Number
 */
let lastAPY;

/**
 * Update the validatorsData object with the account info metadata from the blockchain.
 * @returns {Promise<number>}
 */
async function updateLastEraInfo() {
  let block;
  try {
    if (process.env.DATA_API) {
      const lastSwitchBlock = (await (await fetch(process.env.DATA_API + '/blocks?limit=1&order=timestamp.desc&era_end=eq.true')).json())[0].height;
      block = (await client.casperRPC.getBlockInfoByHeight(lastSwitchBlock)).block;
    } else {
      block = (await client.casperRPC.getLatestBlockInfo()).block;
    }
  } catch (e) {
    block = (await client.casperRPC.getLatestBlockInfo()).block;
  }
  if (lastEra !== block.header.era_id - 1) {
    while (!block.header.era_end) {
      block = (await client.casperRPC.getBlockInfoByHeight(block.header.height - 1)).block;
    }
    lastEra = block.header.era_id;
    const totalStake = block.header.era_end.next_era_validator_weights
      .reduce((total, { weight }) => total.plus(weight), Big(0));

    const eraInfo = await client.casperRPC.getEraInfoBySwitchBlock(block.hash);
    const rewards = eraInfo.StoredValue.EraInfo.seigniorageAllocations
      .reduce((total, alloc) => total.plus((alloc.Validator || alloc.Delegator).amount), Big(0));

    lastAPY = rewards.times(12 * 365).div(totalStake).times(100);
  }
  return lastAPY;
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
  try {
    res.send(await updateLastEraInfo());
  } catch (e) {
    res.sendStatus(503);
  }
});

router.get('/supply', async function(req, res, next) {
  try {
    const cclient = new ClientCasper(process.env.CASPER_RPC_URL);
    const stateRootHash = await cclient.casperRPC.getStateRootHash();
    const testnetUref = 'uref-5d7b1b23197cda53dec593caf30836a5740afa2279b356fae74bf1bdc2b2e725-007';
    const mainnetUref = 'uref-8032100a1dcc56acf84d5fc9c968ce8caa5f2835ed665a2ae2186141e9946214-007';
    const uref = process.env.NETWORK === 'casper' ? mainnetUref : testnetUref;
    const supply = await fetch(process.env.CASPER_RPC_URL, {
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
    });
    const totalSupply = (await supply.json()).result.stored_value.CLValue.parsed;
    res.send(totalSupply);
  } catch (e) {
    res.sendStatus(503);
  }
});

module.exports = router;
