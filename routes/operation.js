const express = require('express');
const router = express.Router();

router.get('/metrics', function (req, res, next) {
    const end = Date.now();
    const start = new Date();
    start.setHours(start.getHours() - 1);
    const url = `http://prometheus-stack-kube-prom-prometheus.monitoring:9090/api/v1/query_range?query=sum(rate(casperholders_operations[1m])%20*%2060)%20by%20(type,%20namespace)&start=${start.getTime()}&end=${end}&step=60`;
    fetch(url).then((response) => {
        console.log(response);
        res.send(response.body);
    }).catch((e) => {
        console.log(e);
        res.send(e);
    })
})

module.exports = router;
