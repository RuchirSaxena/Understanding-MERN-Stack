const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Get Post Model
const Post = require("../../models/Post");
//Get Post Validation
const validatePostInput = require("../../validation/post");
const validateCommentInput = require("../../validation/commnet");

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

// @route POST api/posts/like/:id
// @desc  Like Post
// @access Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then(profile => {
        console.log("log 106:" + req.params.id);
        Post.findById(req.params.id)
          .then(post => {
            console.log("log 109:" + post);
            let likeLength = post.likes.filter(like => {
              return like.user.toString() === req.user.id.toString();
            });
            console.log("113 Likes length:" + likeLength.length);
            if (likeLength.length > 0) {
              return res
                .status(400)
                .json({ alreadyLiked: "User already liked this post" });
            }

            //Add user id to likes array
            post.likes.push({ user: req.user.id });

            post.save().then(post => res.json(post));
          })
          .catch(err =>
            res.status(404).json({ postNotFound: "No post found" })
          );
      })
      .catch(err => res.status(404).json({ postNotFound: "No post found" }));
  }
);

// @route POST api/posts/unlike/:id
// @desc  Unlike Post
// @access Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOne({ user: req.user.id })
      .then(profile => {
        console.log("log 106:" + req.params.id);
        Post.findById(req.params.id)
          .then(post => {
            console.log("log 109:" + post);
            let likeLength = post.likes.filter(like => {
              return like.user.toString() === req.user.id.toString();
            });
            console.log("113 Likes length:" + likeLength.length);
            if (likeLength.length === 0) {
              return res
                .status(400)
                .json({ notLiked: "User has not liked this post" });
            }

            //Remove user id to likes array
            const removeUserIndex = post.likes.findIndex(item => {
              return item.user.toString() === req.user.id.toString();
            });

            post.likes.splice(removeUserIndex, 1);

            post.save().then(post => res.json(post));
          })
          .catch(err =>
            res.status(404).json({ postNotFound: "No post found" })
          );
      })
      .catch(err => res.status(404).json({ postNotFound: "No post found" }));
  }
);

//@route  /posts/addComment/:post_id
//@desc   Add comment to post
//@access Private

router.post(
  "/addcomment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { isValid, errors } = validateCommentInput(req.body);
    if (!isValid) {
      return res.status(403).json(errors);
    }

    Post.findById(req.params.post_id)
      .then(post => {
        const newComment = {
          user: req.user.id,
          text: req.body.text,
          name: req.user.name,
          avatar: req.user.avatar
        };
        console.log("line 191", post.comments);
        //save comment for post
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ notFound: err.toString() }));
  }
);

//@route  Delete api/posts/deletecomment/:post_id/:comment_id
//@desc Delete a specific comment
//@access Private
router.delete(
  "/deletecomment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        // Check to see if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exsits" });
        }
        //delete a comment
        const removeCommentIndex = post.comments
          .map(item => {
            return item._id.toString();
          })
          .indexOf(req.params.comment_id);

        post.comments.splice(removeCommentIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.json(err.toString() + "test"));
  }
);

module.exports = router;
