//Setting up port
const express = require("express");
const mongoose = require("mongoose");

const app = express();

//DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB Database
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected Sucessfully :)"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello1 "));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on ${port}`));
