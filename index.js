const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");
const dotenv = require("dotenv");
const compression = require("compression");

dotenv.config();
const app = express();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    app.use(express.json());
    app.use(morgan("dev"));
    app.use(compression());
    app.use("/api", routes);

    app.listen(5000, () => {
      console.log("Server has started!");
    });
  } catch (err) {
    process.exit(1);
  }
};
run().catch((err) => console.log(err.message));

module.exports = app;
