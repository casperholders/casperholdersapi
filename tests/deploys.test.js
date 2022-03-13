const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.testnet' });
const app = require('../app');
const models = require('../models');

jest.setTimeout(200000);

describe('Deploy endpoint', () => {
  beforeAll(async () => {
    await models.sequelize.sync({ force: true });
  });

  it('should return 404 to retrieve unknown deploy', async () => {
    const res = await request(app)
      .get('/deploys/test');
    expect(res.statusCode).toEqual(404);
  });

  it('should insert a deploy, fail to insert it twice, fail to insert bad deploy, success to retrieve the inserted deploy', async () => {
    let payload = JSON.parse("{\"deploy\":{\"hash\":\"fddcca01a590d6d41ca767cbb9bbe6222a068582e2dc786cd9dfe10fc519dbee\",\"header\":{\"ttl\":\"30m\",\"account\":\"011a2a0ae0fc96c1bb706197bdbc0f8fb85b3ac894861e39997242d5541f3e57a8\",\"body_hash\":\"03d035c2ed02601f0c9f899a611122f08506b491c8d149779c1de943f2036fde\",\"gas_price\":1,\"timestamp\":\"2022-03-13T01:08:01.079Z\",\"chain_name\":\"casper-test\",\"dependencies\":[]},\"payment\":{\"ModuleBytes\":{\"args\":[[\"amount\",{\"bytes\":\"0400e1f505\",\"parsed\":\"100000000\",\"cl_type\":\"U512\"}]],\"module_bytes\":\"\"}},\"session\":{\"Transfer\":{\"args\":[[\"amount\",{\"bytes\":\"0400f90295\",\"parsed\":\"2500000000\",\"cl_type\":\"U512\"}],[\"target\",{\"bytes\":\"01d2e1392dbc73de9f896c62a21163f6b3816c3ec1d6c59da1600d882e2a788013\",\"parsed\":\"01d2e1392dbc73de9f896c62a21163f6b3816c3ec1d6c59da1600d882e2a788013\",\"cl_type\":\"PublicKey\"}],[\"id\",{\"bytes\":\"010000000000000000\",\"parsed\":0,\"cl_type\":{\"Option\":\"U64\"}}]]}},\"approvals\":[{\"signer\":\"011a2a0ae0fc96c1bb706197bdbc0f8fb85b3ac894861e39997242d5541f3e57a8\",\"signature\":\"0133f661369a38d5a7c65b1e32ca5da2901292ce9f2a58a84a710c511ce664a10a9e59c81e18725033bc26f30b53cef973ed2ec56ab01316e04fbe76bdac802b09\"}]}}")
    let res = await request(app)
        .post('/deploys/').send(payload);
    expect(res.statusCode).toEqual(201);
    payload = {}
    res = await request(app)
        .post('/deploys/').send(payload);
    expect(res.statusCode).toEqual(400);
    res = await request(app)
        .get('/deploys/fddcca01a590d6d41ca767cbb9bbe6222a068582e2dc786cd9dfe10fc519dbee');
    expect(res.statusCode).toEqual(200);
  });
});
