const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.error' });
const app = require('../app');

jest.setTimeout(200000);

describe('Apy endpoint', () => {
  it('should return 503 to retrieve apy infos when the api is started with unreachable node', async () => {
    const res = await request(app)
      .get('/apy/current');
    expect(res.statusCode).toEqual(503);
  });
});
