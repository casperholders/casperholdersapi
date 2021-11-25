const express = require('express');
const { Big } = require('big.js');
const { ClientCasper } = require('@casperholders/core/dist/services/clients/clientCasper');
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
 *      '200':
 *        description: Current APY
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/APY'
 */
router.get('/current', async function (req, res, next) {
  res.send(await updateLastEraInfo());
});

module.exports = router;
