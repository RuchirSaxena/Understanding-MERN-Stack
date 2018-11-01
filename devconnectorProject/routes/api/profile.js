const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load profile Model
const Profile = require('../../models/Profile');
//Load user Model
const User = require('../../models/User');


// @route GET api/profiles/test
// @desc  Test profile route
// @access Public
router.get("/test", (req, res) => {
  res.json({ msg: "profile route works!" });
});

// @route GET api/profiles/:id
// @desc  Get current user profile 
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        return res.status(404).json(errors);
      }
      res.json(profile);
    }).catch(err => res.status(404).json(err));
});

module.exports = router;
