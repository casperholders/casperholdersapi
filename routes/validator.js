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
 * Validators informations
 * @type {*[]}
 */
let validatorsData = [];

/**
 * Update the validatorsData object with the account info metadata from the blockchain.
 * @returns {Promise<void>}
 */
async function updateValidators() {
  const validatorsInfo = (await client.casperRPC.getValidatorsInfo()).auction_state.bids;
  validatorsData = [];
  for (const validatorInfo of validatorsInfo) {
    let totalStake = '0';
    if(validatorInfo.bid.delegators.length > 0){
      totalStake = validatorInfo.bid.delegators.reduce((prev, next) => {
        return { staked_amount: Big(prev.staked_amount).plus(next.staked_amount).toString()}
      }).staked_amount
    }
    totalStake = Big(totalStake).plus(validatorInfo.bid.staked_amount).toString();
    const stakedAmount = CurrencyUtils.convertMotesToCasper(totalStake);
    validatorsData.push({
      name: validatorInfo.public_key,
      publicKey: validatorInfo.public_key,
      group: validatorInfo.bid.inactive ? 'Inactive' : 'Active',
      delegation_rate: validatorInfo.bid.delegation_rate,
      staked_amount: new Big(stakedAmount).toFixed(2),
    });
  }
  const firstValidatorInfo = validatorsData[0];
  if (firstValidatorInfo) {
    await updateValidator(firstValidatorInfo);
    await Promise.all(validatorsData.map(updateValidator));
  }
}

/**
 * Update a validator with metadata
 * @param validatorInfo
 * @returns {Promise<void>}
 */
async function updateValidator(validatorInfo) {
  try {
    const metadata = (await validatorsService.getValidatorInfo(
      validatorInfo.name,
      process.env.ACCOUNT_INFO_HASH, process.env.NETWORK,
    ));
    validatorInfo.name = metadata.owner?.name ? metadata.owner?.name : validatorInfo.name;
    if(metadata.owner?.branding?.logo?.svg){
      validatorInfo.logo = metadata.owner?.branding?.logo?.svg
    }
  } catch (e) {
    if (!(e instanceof NoValidatorInfos)) {
      console.log(e);
    }
  }
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
  res.send(validatorsData);
});

module.exports = { router, updateValidators };
