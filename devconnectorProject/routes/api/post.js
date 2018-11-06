const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Get Post Model
const Post = require("../../models/Post");
//Get Post Validation
const validatePostInput = require("../../validation/post");

// @route GET api/posts/test
// @desc  Test post route
// @access Public
router.get("/test", (req, res) => {
  res.json({ msg: "post route works!" });
});

// @route POST api/posts
// @desc  Creat Post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //validation
    console.log("1");
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      console.log("Some errors occured");
      return res.status(400).json(errors);
    }
    console.log("2");
    //  console.log(`Text content length: ${req.body.text.length}`);
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    console.log("3");
    newPost.save().then(post => {
      console.log("Post Result:", post);
      res.json(post);
    });
  }
);

// @route GET api/posts
// @desc  GET Post
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(post => res.json(post))
    .catch(err => res.status(400).json({ noPostsFound: "No posts found" }));
});

// @route GET api/posts/:id
// @desc  GET Post by id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(403).json({ noPostFound: "No post find by this id" })
    );
});

// @route DELETE api/posts/:post_Id
// @desc  Delete Post
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: "User not authorized to delete" });
            }
            //Delete
            post.remove().then(() => res.json({ succes: true }));
          })
          .catch(err => res.status(400).json(err));
      })
      .catch(err => res.status(400).json(err));
  }
);

module.exports = router;
