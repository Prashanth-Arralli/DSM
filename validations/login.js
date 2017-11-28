var schema = {
  'email': {
    notEmpty: true,
    errorMessage: 'Email is required.',
    isEmail: {
      errorMessage: 'Invalid Email.'
    }
  },
  'platform': {
    notEmpty: true,
    errorMessage: 'Platform is required.',
    matches: {
      options: [/\b(?:web|ios|android|h}")\b/],
      errorMessage: "Invalid platform."
    }
  },
  'password': {
    notEmpty: true,
    errorMessage: 'Invalid Password.', // Error message for the parameter
    isLength: {
      options: [{
        min: 5,
        max: 10
      }],
      errorMessage: 'Must be between 6 and 10 chars long.' // Error message for the validator, takes precedent over parameter message
    },
  }
};
module.exports = schema;
