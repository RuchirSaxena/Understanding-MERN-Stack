const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateExperinceInput = data => {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : ""; //required
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : ""; //required

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title feild is required";
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = "Company feild is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From Date feild is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
