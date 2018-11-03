const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = validateRegisterInput = data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be 2 and 30 charactors";
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name feild is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email not valid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email feild is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be atleast 6 characters";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password feild is required";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "password and confirm password are not equal";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password feild is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
