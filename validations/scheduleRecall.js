var schema = {
  'vin': {
      notEmpty: true,
      errorMessage: 'Vin is required.', // Error message for the parameter
  }
};
module.exports = schema;
