const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");
const dotenv = require("dotenv");
const compression = require("compression");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const DB_CONNECTION = require("./constants/DB_CONNECTION");
const apiDocumentation = YAML.load("./swagger.yml");

dotenv.config();
const app = express();
const run = async () => {
  try {
    await mongoose.connect(DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB connected successfully");

    app.use(express.json());
    app.use(morgan("dev"));
    app.use(compression());

    app.use("/api", routes);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocumentation));

    app.listen(process.env.PORT, () => {
      console.log("Server has started!");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
run().catch((err) => console.log(err.message));

module.exports = app;
