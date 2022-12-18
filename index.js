const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");
const dotenv = require("dotenv");
const compression = require("compression");
const DB_NAME = require("./constants/DB_CONNECTION");
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

const apiDocumentation = YAML.load('./swagger.yml')


dotenv.config();
const app = express();

const run = async () => {
  try {
  
    const dbConnection = `${process.env.MONGO_URI}/${DB_NAME}`  
    await mongoose.connect(dbConnection, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('DB connected', dbConnection)

    app.use(express.json());
    app.use(morgan("dev"));
    app.use(compression());
    app.use('/', swaggerUi.serve, swaggerUi.setup(apiDocumentation))
    app.use("/api", routes);

    app.listen(process.env.PORT, () => {
      console.log("Server has started!");
    });
  } catch (err) {
    console.log(err.message)
    process.exit(1);
  }
};
run().catch((err) => console.log(err.message));

module.exports = app;
