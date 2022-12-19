require("dotenv").config();
const DB_CONNECTION =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev"
    ? process.env.MONGO_URI_DEV
    : process.env.MONGO_URI_PROD;

module.exports = DB_CONNECTION;
