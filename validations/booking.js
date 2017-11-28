var schema = {
  'vin': {
    notEmpty: true,
    errorMessage: 'vin number is required.',
  },
  'booked_at': {
    notEmpty: true,
    errorMessage: 'Slot time is required.', // Error message for the parameter
  }
};
module.exports = schema;
