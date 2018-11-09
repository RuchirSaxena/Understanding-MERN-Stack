const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateCommentInput = data => {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!Validator.isLength(data.text, { min: 5, max: 50 })) {
    console.log(`Length:${data.text.length}`);
    errors.text = "Post must be between 10 to 300 characters";
  }

  if (Validator.isEmpty(data.text)) {
    errors.text = "Comment text feild is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
