const express = require('express');
const { Big } = require('big.js');
const { orderBy } = require('lodash');
const { ClientCasper, CurrencyUtils } = require('@casperholders/core');
const { CLPublicKey } = require('casper-js-sdk');
const router = express.Router();
const client = new ClientCasper(process.env.CASPER_RPC_URL);

/**
 * Validators informations
 * @type {Map<any, any>}
 */
let validatorsData = new Map();
let sortedValidatorData = [];
let lastKnownAccountInfoDeploy;

/**
 * Update the validatorsData object with the account info metadata from the blockchain.
 * @returns {Promise<void>}
 */
async function updateValidators(force = false) {
  const contractHashes = (await (await fetch(`${process.env.DATA_API}/contracts?select=hash&package=eq.${process.env.ACCOUNT_INFO_PACKAGE}`)).json()).map((c) => c.hash);
  const lastAccountInfoDeploy = (await (await fetch(`${process.env.DATA_API}/deploys?select=timestamp&limit=1&contract_hash=in.(${contractHashes.join(',')})`)).json())[0].timestamp;
  let refreshAccountInfo = false;
  if (lastAccountInfoDeploy !== lastKnownAccountInfoDeploy) {
    refreshAccountInfo = true;
    lastKnownAccountInfoDeploy = lastAccountInfoDeploy;
  } else {
    console.log('No refresh account info');
  }
  const validatorsInfo = (await client.casperRPC.getValidatorsInfo()).auction_state.bids;
  const stateRootHash = await client.casperRPC.getStateRootHash(
    (await client.casperRPC.getLatestBlockInfo()).block.hash,
  );
  const validators = (await client.casperRPC.getValidatorsInfo()).auction_state.era_validators;
  const currentEra = validators[0].validator_weights.map(v => v.public_key);
  const nextEra = validators[1].validator_weights.map(v => v.public_key);
  const accountInfoPromises = [];
  for (const validatorInfo of validatorsInfo) {
    let totalStake = '0';
    if (validatorInfo.bid.delegators.length > 0) {
      totalStake = validatorInfo.bid.delegators.reduce((prev, next) => {
        return { staked_amount: Big(prev.staked_amount).plus(next.staked_amount).toString() };
      }).staked_amount;
    }
    totalStake = Big(totalStake).plus(validatorInfo.bid.staked_amount).toString();
    const stakedAmount = CurrencyUtils.convertMotesToCasper(totalStake);
    let previousValidatorData = validatorsData.get(validatorInfo.public_key);
    if (previousValidatorData === undefined || force || refreshAccountInfo) {
      previousValidatorData = {
        name: validatorInfo.public_key,
        publicKey: validatorInfo.public_key,
        group: validatorInfo.bid.inactive ? 'Inactive' : 'Active',
        delegation_rate: validatorInfo.bid.delegation_rate,
        staked_amount: Big(stakedAmount).toFixed(2),
        currentEra: currentEra.includes(validatorInfo.public_key),
        nextEra: nextEra.includes(validatorInfo.public_key),
        numberOfDelegators: validatorInfo.bid.delegators.length,
      };
      accountInfoPromises.push(updateValidator(previousValidatorData, stateRootHash).then((r) => validatorsData.set(validatorInfo.public_key, r)));
    } else {
      previousValidatorData.publicKey = validatorInfo.public_key;
      previousValidatorData.group = validatorInfo.bid.inactive ? 'Inactive' : 'Active';
      previousValidatorData.delegation_rate = validatorInfo.bid.delegation_rate;
      previousValidatorData.staked_amount = Big(stakedAmount).toFixed(2);
      previousValidatorData.currentEra = currentEra.includes(validatorInfo.public_key);
      previousValidatorData.nextEra = nextEra.includes(validatorInfo.public_key);
      previousValidatorData.numberOfDelegators = validatorInfo.bid.delegators.length;
      validatorsData.set(validatorInfo.public_key, previousValidatorData);
    }
  }
  await Promise.all(accountInfoPromises);
  sortedValidatorData = orderBy(
    Array.from(validatorsData.values()),
    [
      ({ publicKey }) => publicKey.toLowerCase() !== '013725fe8df379be1e1cc8c571fc4d21b584dc8bb126000c7ab70db1ed4fb9d751',
      ({ logo }) => !logo,
      ({ name, publicKey }) => name !== publicKey,
      ({ staked_amount }) => Big(staked_amount).toNumber(),
      'delegation_rate',
    ],
    [
      'asc',
      'asc',
      'asc',
      'desc',
      'asc',
    ],
  );
}

async function getAccountInfoData(publicKey, stateRootHash) {
  const clpublicKey = CLPublicKey.fromHex(publicKey);
  const accountHash = clpublicKey.toAccountHashStr()
    .replace('account-hash-', '');
  const accountInfoUrl = (
    await client.casperRPC.getDictionaryItemByName(
      stateRootHash,
      `hash-${process.env.ACCOUNT_INFO_HASH}`,
      'account-info-urls',
      accountHash,
    )
  ).CLValue.data;
  const url = `${accountInfoUrl}/.well-known/casper/account-info.${process.env.NETWORK}.json`;

  const response = await Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`timeout fetching ${url}`)), 5000),
    ),
  ]);
  if (response instanceof Error) {
    throw response;
  }
  return await response.json();
}

/**
 * Update a validator with metadata
 * @param validatorInfo
 * @returns {Promise<void>}
 */
async function updateValidator(validatorInfo, stateRootHash) {
  try {
    const metadata = await getAccountInfoData(validatorInfo.name, stateRootHash);

    validatorInfo.name = metadata.owner?.name ? metadata.owner?.name : validatorInfo.name;
    if (metadata.owner?.branding?.logo?.svg) {
      validatorInfo.logo = metadata.owner?.branding?.logo?.svg;
    } else if (metadata.owner?.branding?.logo?.png_256) {
      validatorInfo.logo = metadata.owner?.branding?.logo?.png_256;
    } else if (metadata.owner?.branding?.logo?.png_1024) {
      validatorInfo.logo = metadata.owner?.branding?.logo?.png_1024;
    }
    if (metadata.owner?.branding?.logo?.png_256) {
      validatorInfo.png = metadata.owner?.branding?.logo?.png_256;
    } else if (metadata.owner?.branding?.logo?.png_1024) {
      validatorInfo.png = metadata.owner?.branding?.logo?.png_1024;
    }
    validatorInfo.metadata = metadata;
  } catch (e) {
    console.log(`No info for ${validatorInfo.name}`);
  }
  return validatorInfo;
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
 *          numberOfDelegators:
 *            type: int
 *            description: Number of delegators on the node
 *        example:
 *          name: CasperHolders
 *          group: Active
 *          delegation_rate: 0
 *          publicKey: 0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5
 *          staked_amount: "100"
 *          numberOfDelegators: 1000
 *      ValidatorsInfos:
 *        type: array
 *        items:
 *          $ref: '#/definitions/ValidatorInfo'
 * /validators/accountinfos:
 *  get:
 *    description: Get validator info from the blockchain auction state. Add additional metadata asynchronously
 *    responses:
 *      '503':
 *        description: No server available
 *      '200':
 *        description: Return array of validator infos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ValidatorsInfos'
 */
router.get('/accountinfos', async function(req, res, next) {
  if (sortedValidatorData.length === 0) {
    res.sendStatus(503);
  } else {
    res.send(sortedValidatorData);
  }
});

/**
 * @swagger
 * definitions:
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
 *          numberOfDelegators:
 *            type: int
 *            description: Number of delegators on the node
 *        example:
 *          name: CasperHolders
 *          group: Active
 *          delegation_rate: 0
 *          publicKey: 0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5
 *          staked_amount: "100"
 *          numberOfDelegators: 1000
 * /validators/accountinfos/{publicKey}:
 *  get:
 *    description: Get validator info from the blockchain auction state. Add additional metadata asynchronously
 *    parameters:
 *      - in: path
 *        name: publicKey
 *        schema:
 *          type: string
 *        required: true
 *        description: publicKey of the validator
 *    responses:
 *      '503':
 *        description: No server available
 *      '404':
 *        description: Not found
 *      '200':
 *        description: Return validator infos
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ValidatorInfo'
 */
router.get('/accountinfos/:hash', async function(req, res, next) {
  if (sortedValidatorData.length === 0) {
    res.sendStatus(503);
  } else {
    const v = sortedValidatorData.filter((i) => i.publicKey === req.params.hash);
    if (v.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(v[0]);
    }
  }
});

router.get('/metadata/:hash', async function(req, res, next) {
  try {
    const stateRootHash = await client.casperRPC.getStateRootHash(
      (await client.casperRPC.getLatestBlockInfo()).block.hash,
    );
    res.send(await getAccountInfoData(req.params.hash, stateRootHash));
  } catch (e) {
    res.sendStatus(404);
  }
});

module.exports = { router, updateValidators };
