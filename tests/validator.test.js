const request = require('supertest');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const app = require('../app');
const { updateValidators } = require('../routes/validator');

jest.setTimeout(200000);

beforeEach(async () => {
  await updateValidators();
});

describe('Deploy endpoint', () => {
  it('should return 200 to retrieve validator infos', async () => {
    const res = await request(app)
      .get('/validators/accountinfos');
    console.log(res.body.filter((validator) => validator.publicKey === "0124bfdae2ed128fa5e4057bc398e4933329570e47240e57fc92f5611a6178eba5"));
    expect(res.statusCode).toEqual(200);
  });
});
