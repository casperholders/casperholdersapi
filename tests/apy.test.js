require("regenerator-runtime/runtime");
const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.testnet' });
const app = require('../app');

jest.setTimeout(200000);

describe('Apy endpoint', () => {
  it('should return 200 to retrieve apy infos', async () => {
    const res = await request(app)
      .get('/apy/current');
    expect(res.statusCode).toEqual(200);
  });
});
