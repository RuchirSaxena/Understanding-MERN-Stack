const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load profile Model
const Profile = require("../../models/Profile");
//Load  Validations
const validationProfileInput = require("../../validation/profile");
const validateExperinceInput = require("../../validation/experince");
const validateEducationInput = require("../../validation/education");
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

//Backend Routes
// @route GET api/profiles/handle/:handle
// @desc  Get user profile from handle
// @access Public

router.get("/handle/:handle", (req, res) => {
  const erros = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        erros.noprofile = "There is no profile for this user";
        res.status(404).json(erros);
      } else {
        res.status(200).json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

// @route GET api/profiles/user/:user_id
// @desc  Get user profile from user is
// @access Public

router.get("/user/:user_id", (req, res) => {
  const erros = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        erros.noprofile = "There is no profile for this user";
        res.status(404).json(erros);
      } else {
        res.status(200).json(profile);
      }
    })
    .catch(err => {
      erros.noprofile = "There is no profile for this user";
      res.status(404).json(erros);
    });
});

// @route GET api/profiles/all
// @desc  Get all user profiles from
// @access Public
router.get("/all", (req, res) => {
  let errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        erros.noprofile = "There is no profile for this user";
        res.status(404).json(erros);
      }
      res.status(200).json(profiles);
    })
    .catch(err => {
      erros.noprofile = "There is no profile for this user";
      res.status(404).json(erros);
    });
});

// @route POST api/profiles/experince
// @desc  Add Experince to  profiles
// @access Private
router.post(
  "/experince",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Validdation
    const { errors, isValid } = validateExperinceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExperince = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to Exprince array
      profile.experince.unshift(newExperince);

      profile.save(newExperince).then(profile => res.json(profile));
    });
  }
);

// @route POST api/profiles/education
// @desc  Add education to  profiles
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //Validdation
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEducation = {
        school: req.body.school,
        degree: req.body.degree,
        feildOfStudy: req.body.feildOfStudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to Exprince array
      profile.education.unshift(newEducation);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route DELETE api/profiles/experince/:exp_id
// @desc  Delete exeprince
// @access Private
router.delete(
  "/experince/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experince
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        // Splice out of array
        profile.experince.splice(removeIndex, 1);
        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route DELETE api/profiles/education/:edu_id
// @desc  Delete education
// @access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route DELETE api/profiles
// @desc  Delete User with profile
// @access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(profile => {
      User.findOneAndRemove({ _id: req.user.id }).then(() => {
        res.status(200).json({ success: true });
      });
    });
  }
);

module.exports = router;
