const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /operations/metrics:
 *  get:
 *    description: Fetch the metrics from your prometheus instance or from the override url provided.
 *    responses:
 *      '200':
 *        description: Return the metrics in the prometheus format
 *      '404':
 *        description: If the override api or the prometheus isn't reachable it returns a 404
 */
router.get('/metrics', function (req, res, next) {
    let url = ""
    if (process.env.OVERRIDE_API_ENDPOINTS === "true") {
        url = process.env.OVERRIDE_API_URL+"/operations/metrics"
    } else {
        const end = Math.floor(Date.now() / 1000);
        const date = new Date();
        const start = Math.floor(date.getTime() / 1000) - 86400
        url = process.env.PROMETHEUS_API+`/query_range?query=sum(increase(casperholders_operations[1h]))%20by%20(type,%20namespace)&start=${start}&end=${end}&step=60`;
    }
    fetch(url).then((response) => {
        response.json().then((data) => {
            res.send(data);
        }).catch((e) => {
            console.log(e);
            res.sendStatus(404);
        })
    }).catch((e) => {
        console.log(e);
        res.sendStatus(404);
    })

})

module.exports = router;
