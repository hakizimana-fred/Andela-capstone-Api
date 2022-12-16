const mongoose = require("mongoose");
const DB_NAME = require("../constants/DB_CONNECTION");
mongoose.Promise = global.Promise;
require("dotenv").config();
const dbConnection = `${process.env.MONGO_URI}/${DB_NAME}`  

mongoose.connect(dbConnection);


mongoose.connection
  .once("open", () => console.log("connected"))
  .on("error", (error) => {
    console.warn("Error: ", error);
  });

beforeEach((done) => {
  mongoose.connection.collections.users.drop(() => {
    done();
  });
});
