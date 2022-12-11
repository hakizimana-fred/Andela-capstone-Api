const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const morgan = require("morgan");

const run = async () => {
   try{ 
    await mongoose.connect('mongodb://localhost/capstonedb') 
    console.log('DB started successfully')

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