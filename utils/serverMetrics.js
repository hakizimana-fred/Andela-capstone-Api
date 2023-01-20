const express = require('express');
const client = require('prom-client');


const app = express();


// rest api histogram
const restApiHistogram = new client.Histogram({
  name: 'rest_response_time_duration_seconds',
  help: 'REST API response time in seconds',
  labelNames: ['method', 'route', 'status_code'],
});
// database histogram
const dbHistogram = new client.Histogram({
  name: 'db_response_time_duration_seconds',
  help: 'Database response time in seconds',
  labelNames: ['operation', 'success'],
});

// function to start server metrics
const startMetrics = () => {
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);

    return res.send(await client.register.metrics());
  });

  app.listen(8000, () => console.log(`http://localhost:8000/metrics`));
};


module.exports = {
  startMetrics,
  restApiHistogram,
  dbHistogram,
};
