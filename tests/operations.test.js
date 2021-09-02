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
    it('should return 404 to test failover of the override endpoint', async () => {
        process.env.OVERRIDE_API_URL = "random string"
        const res = await request(app)
            .get('/operations/metrics')
        expect(res.statusCode).toEqual(404)
    })
})