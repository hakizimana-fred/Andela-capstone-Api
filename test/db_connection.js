const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

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
