const request = require('supertest')
const dotenv = require("dotenv");
dotenv.config({path: './.env.mainnet'});
const app = require('../app')
jest.setTimeout(20000);

describe('Deploy endpoint', () => {
    it('should return 200 to retrieve validator infos', async () => {
        const res = await request(app)
            .get('/validators/accountinfos')
        expect(res.statusCode).toEqual(200)
    })
})