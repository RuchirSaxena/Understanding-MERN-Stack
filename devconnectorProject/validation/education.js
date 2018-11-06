const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateExperinceInput = data => {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : ""; //required
  data.feildOfStudy = !isEmpty(data.feildOfStudy) ? data.feildOfStudy : "";
  data.from = !isEmpty(data.from) ? data.from : ""; //required

  if (Validator.isEmpty(data.school)) {
    errors.school = "School feild is required";
  }

  if (Validator.isEmpty(data.feildOfStudy)) {
    errors.feildOfStudy = "feildOfStudy feild is required";
  }

  if (Validator.isEmpty(data.from)) {
    errors.from = "From Date feild is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
