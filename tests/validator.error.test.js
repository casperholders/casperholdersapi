require("regenerator-runtime/runtime");
const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.error' });
const app = require('../app');
const { updateValidators } = require('../routes/validator');

jest.setTimeout(200000);

beforeEach(async () => {
  try {
    await updateValidators();
  } catch (e) {

  }
});

describe('Validator endpoint', () => {
  it('should return 503 to retrieve validator infos when the apy is started with unreachable node', async () => {
    await request(app)
      .get('/validators/accountinfos')
      .expect(503);
  });
});
