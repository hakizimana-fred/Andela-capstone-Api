const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");
const dotenv = require('dotenv')

dotenv.config()

const run = async () => {
   try{ 
    await mongoose.connect(process.env.MONGO_URI) 

    const app = express();
    app.use(express.json());
    app.use(morgan("dev"));
    app.use("/api", routes);

    app.listen(5000, () => {
      console.log("Server has started!");
    });


   }catch(err) {
    process.exit(1)
   }
}
run().catch(err => console.log(err.message))