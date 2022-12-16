const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");
const dotenv = require("dotenv");
const compression = require("compression");
const DB_NAME = require("./constants/DB_CONNECTION");

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
    app.use("/api", routes);

    app.listen(5000, () => {
      console.log("Server has started!");
    });
  } catch (err) {
    console.log(err.message)
    process.exit(1);
  }
};
run().catch((err) => console.log(err.message));

module.exports = app;
