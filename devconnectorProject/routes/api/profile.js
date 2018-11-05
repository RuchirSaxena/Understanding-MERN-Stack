const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load profile Model
const Profile = require("../../models/Profile");
//Load profile Validation
const validationProfileInput = require("../../validation/profile");

//Load user Model
const User = require("../../models/User");

// @route GET api/profiles/test
// @desc  Test profile route
// @access Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile route works!" });
});

// @route GET api/profiles/:id
// @desc  Get current user profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    // console.log("response:" + req.user);

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"]) //Used to get data from User data(name,avatax) collection
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route POST api/profiles/
// @desc  Create/Update current user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Validdation
    const { errors, isValid } = validationProfileInput(req.body);
    //check validation
    if (!isValid) {
      // console.log(`Error ${errors}`);
      return res.status(400).json(errors);
    }

    // Get fields
    // console.log(req.body);
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills -spilit into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        console.log(`Post data ${profile}`);
        // Update profile
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //create profile

        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          //First : Check if handle exists
          if (profile) {
            erros.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          //Second : If not exists then => Save Profile
          //console.log("line 100:", profileFields);
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
