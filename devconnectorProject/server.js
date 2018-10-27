//Setting up port
const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const profiles = require("./routes/api/profile");
const posts = require("./routes/api/post");

const app = express();

//DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB Database
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected Sucessfully :)"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello1 "));

//Use Routes and setup the base url of API i.e./api/users/<your router>
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on ${port}`));
