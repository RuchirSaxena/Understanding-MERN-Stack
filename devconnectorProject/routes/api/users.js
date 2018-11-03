const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load user model
const User = require("../../models/User");

//Get sceret key from config
const sceretKey = require("../../config/keys").secretKey;

// @route GET api/users/test
// @desc  Test user route
// @access Public
router.get("/test", (req, res) => res.json({ msg: "user route works" }));

// @route GET api/users/register
// @desc  Register user
// @access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  //To find the first matching record
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //rating
        d: "mm" // default image
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          //create new user
          newUser.password = hash;
          newUser
            .save() //save() is provided by mongoose and is used to save the data to the mongodb
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET api/users/login
// @desc  Login User /Return JWT Token
// @access Public
router.post("/login", (req, res) => {
  //Validating response
  console.log("in login", req.body);
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  console.log(password);

  // Find the user by email
  User.findOne({ email }).then(user => {
    //check for user exists
    console.log(user);
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // check user creadentials i.e. password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //  res.json({ msg: "Success" });
        //User Matched => Create JWT Token
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        //Sign Token
        jwt.sign(payload, sceretKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        errors.password = "password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route GET api/users/current
// @desc  Return current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("returning the user info");
    const { id, name, email } = req.user;
    res.json({
      id,
      name,
      email
    });
  }
);

module.exports = router;
