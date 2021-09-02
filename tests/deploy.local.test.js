const request = require('supertest')
const dotenv = require("dotenv");
dotenv.config({path: './.env'});
const app = require('../app')

describe('Deploy endpoint', () => {
    it('should return 404 for unknown deploy', async () => {
        const res = await request(app)
            .get('/deploy/result/sdfgsfg')
        expect(res.statusCode).toEqual(404)
    })
    it('should return 404 for unsupported deploy', async () => {
        const res = await request(app)
            .get('/deploy/result/050f7c3973041c67ba6f9a74ff35c7e22b632fdf04b78c206bec56c84843fe14')
        expect(res.statusCode).toEqual(404)
    })
    it('should return 204 for failed add bid', async () => {
        const res = await request(app)
            .get('/deploy/result/c7cfbf8735fa2ea06b275e86db0c42f2ff1457190d87b53b67a8c62e713b344c')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success add bid', async () => {
        const res = await request(app)
            .get('/deploy/result/63c078cd598643c2d8c46d57fa37bb4615b93ece67ed32bd704fd5b8425978d7')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for failed withdraw bid', async () => {
        const res = await request(app)
            .get('/deploy/result/e0238c3ac0322b1fdf159e7cc73f4d838f9b2b17eef156774ba2386775e55cf1')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success withdraw bid', async () => {
        const res = await request(app)
            .get('/deploy/result/5bb0c0a7f11b30694ddc3266c3f853d89fdb9ddc8bf41df0f6fa556fab689eb8')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for failed delegate', async () => {
        const res = await request(app)
            .get('/deploy/result/0ea82749e23c75fab6ce1818c66e52b7a75f50e9072c310ac893ccf81472daef')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success delegate', async () => {
        const res = await request(app)
            .get('/deploy/result/16a8c95c3ba53226fb83ef799210026c5eb4085e40d13f84dec6c749ecd66bf5')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for failed undelegate', async () => {
        const res = await request(app)
            .get('/deploy/result/b6474b7ceaeae141b665cff7ca951a5a484a4b7ae148a06343dcb8aac9fd3f87')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success undelegate', async () => {
        const res = await request(app)
            .get('/deploy/result/29f10113d9617b5e05fe1c8829bc6d2b972e8e6159bcb3ffec9a4e47a3567802')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success transfer', async () => {
        const res = await request(app)
            .get('/deploy/result/272a705bc9e939e45622288f8c534e40c20552ef917245036ddb3a2141525326')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for success module bytes', async () => {
        const res = await request(app)
            .get('/deploy/result/297b768f708b540ce76b080f4d99276835fdf5434e28cc3530f9a4259bca9019')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 204 for failed module bytes', async () => {
        const res = await request(app)
            .get('/deploy/result/ccf574eaffd9df76f3288f6139acfe8b372a1f3c12662551969c503de065e976')
        expect(res.statusCode).toEqual(204)
    })
    it('should return 404 to test failover of overrided url', async () => {
        process.env.OVERRIDE_API_URL = "random string"
        const res = await request(app)
            .get('/deploy/result/ccf574eaffd9df76f3288f6139acfe8b372a1f3c12662551969c503de065e976')
        expect(res.statusCode).toEqual(404)
    })
})