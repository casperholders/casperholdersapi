const request = require('supertest')
const dotenv = require("dotenv");
dotenv.config({path: './.env'});
const app = require('../app')

describe('Deploy endpoint', () => {
    it('should return 200', async () => {
        const res = await request(app)
            .get('/operations/metrics')
        expect(res.statusCode).toEqual(200)
    })
})