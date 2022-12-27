const express = require('express')
const client = require('prom-client')

const app = express()

const startMetrics = () => {
    const collectDefaultMetrics = client.collectDefaultMetrics

    collectDefaultMetrics()

    app.get('/metrics', async (req, res) => {
        res.set("Content-Type", client.register.contentType)

        return res.send(await client.register.metrics())
    })

    app.listen(8000, () => console.log('Metrics server started on port 8000'));
}

module.exports = {
    startMetrics
}