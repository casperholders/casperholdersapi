const express = require("express");
const router = express.Router();
const models = require("../models");
const { DeployUtil } = require("casper-js-sdk");

/**
 * @swagger
 * /deploys/{hash}:
 *  get:
 *    description: Return a deploy if present in the database
 *    parameters:
 *      - in: path
 *        name: hash
 *        schema:
 *          type: string
 *        required: true
 *        description: Hash of the deploy
 *    responses:
 *      '404':
 *        description: Not found
 *      '200':
 *        description: Return a deploy
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/Deploy'
 */
router.get("/:hash", async function (req, res, next) {
    const deploy = await models.Deploy.findByPk(req.params.hash);
    if (deploy === null) {
        res.sendStatus(404);
    } else {
        res.send(deploy);
    }
});

/**
 * @swagger
 *  definitions:
 *      Deploy:
 *        type: object
 *        properties:
 *          deploy:
 *              type: object
 *              required: true
 *          deployResult:
 *              type: object
 *              required: true
 * /deploys/:
 *  post:
 *    description: Return a deploy if present in the database
 *    consumes:
 *      - application/json
 *    parameters:
 *      - in: body
 *        name: deploy
 *        schema:
 *          type: object
 *          $ref: '#/definitions/Deploy'
 *        required: true
 *        description: Deploy json object
 *    responses:
 *      '201':
 *        description: Created
 *      '400':
 *        description: Deploy already exist or deploy malformed
 *      '503':
 *        description: Couldn't insert the deploy in the database
 */
router.post("/", async function (req, res, next) {
    const deploy = DeployUtil.deployFromJson(req.body);

    if (deploy.ok) {
        try {
            await models.Deploy.upsert({
                hash: DeployUtil.deployToJson(deploy.val).deploy.hash,
                deploy: DeployUtil.deployToJson(deploy.val),
                deployResult: req.body.deployResult,
            });
            res.sendStatus(201);
        } catch (e) {
            console.log(e);
            res.sendStatus(503);
        }
    } else {
        console.log(deploy.val);
        res.sendStatus(400);
    }
});

module.exports = router;
