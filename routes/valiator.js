const express = require('express');
const { Big } = require('big.js');
const { CurrencyUtils } = require('@casperholders/core');
const { Validators } = require('@casperholders/core/dist/services/validators/validators');
const { ClientCasper } = require('@casperholders/core/dist/services/clients/clientCasper');
const { NoValidatorInfos } = require('@casperholders/core/dist/services/errors/noValidatorInfos');
const router = express.Router();
const client = new ClientCasper(process.env.CASPER_RPC_URL);
const validatorsService = new Validators(client);

/**
 * Cache timeout. 1 hour, if the cache is older than one hour it's invalidated and re-fetch the data from the blockchain.
 * @type {number}
 */
const CACHE_TIMEOUT = 3600;
/**
 * Last time we fetched the validators infos
 * @type {number}
 */
let lastFetch = 0;

/**
 * Validators informations
 * @type {*[]}
 */
let validatorsData = [];

/**
 * Update the validatorsData object with the account info metadata from the blockchain.
 * @returns {Promise<void>}
 */
async function updateValidators() {
  const promises = validatorsData.map(async (validatorInfo) => {
    try {
      validatorInfo.name = (await validatorsService.getValidatorInfo(
        validatorInfo.name,
        process.env.ACCOUNT_INFO_HASH, process.env.NETWORK,
      )).owner.name;
      console.log(validatorInfo.name);
    } catch (e) {
      if (!(e instanceof NoValidatorInfos)) {
        console.log(e);
      }
    }
  });
  await Promise.all(promises);
  console.log('Finished update of validator infos');
}

/**
 * @swagger
 *  definitions:
 *      ValidatorInfo:
 *        type: object
 *        required:
 *          - name
 *          - group
 *          - delegation_rate
 *          - publicKey
 *          - staked_amount
 *        properties:
 *          name:
 *            type: string
 *            description: Name or public key of the validator
 *          group:
 *            type: string
 *            description: Group of the validator Active or Inactive
 *          delegation_rate:
 *            type: int
 *            description: Delegation rate of the validator
 *          publicKey:
 *            type: boolean
 *            description: Public key of the validator
 *          staked_amount:
 *            type: string
 *            description: Number of CSPR staked on the validator
 *        example:
 *          name: CasperHolders
 *          group: Active
 *          delegation_rate: 0
 *          publicKey: 0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5
 *          staked_amount: "100"
 *      ValidatorsInfos:
 *        type: array
 *        items:
 *          $ref: '#/definitions/ValidatorInfo'
 * /validators/accountinfos:
 *  get:
 *    description: Get validator info from the blockchain auction state. Add additional metadata asynchronously
 *    responses:
 *      '200':
 *        description: Return array of validator infos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ValidatorsInfos'
 */
router.get('/accountinfos', async function (req, res, next) {
  if (lastFetch === 0 || (Math.floor(Date.now() / 1000)) - lastFetch > CACHE_TIMEOUT) {
    const validatorsInfo = (await client.casperRPC.getValidatorsInfo()).auction_state.bids;
    validatorsData = [];
    for (const validatorInfo of validatorsInfo) {
      const stakedAmount = CurrencyUtils.convertMotesToCasper(validatorInfo.bid.staked_amount);
      validatorsData.push({
        name: validatorInfo.public_key,
        publicKey: validatorInfo.public_key,
        group: validatorInfo.bid.inactive ? 'Inactive' : 'Active',
        delegation_rate: validatorInfo.bid.delegation_rate,
        staked_amount: new Big(stakedAmount).toFixed(2),
      });
    }

    lastFetch = Math.floor(Date.now() / 1000);
    updateValidators();
  }
  res.send(validatorsData);
});

module.exports = router;
