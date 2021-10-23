const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.testnet' });
const app = require('../app');

jest.setTimeout(200000);

describe('Deploy endpoint', () => {
  it('should return 200 to retrieve validator infos', async () => {
    const res = await request(app)
      .get('/apy/current');
    expect(res.statusCode).toEqual(200);
  });
});
