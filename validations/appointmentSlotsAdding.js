var schema = {
  'starts_on': {
    notEmpty: true,
    errorMessage: 'Start date is required.',
    isDate: {
      errorMessage: 'Start date should be valid date.'
    },
    isFutureDate: {
      errorMessage: 'Start date should be future date.'
    }
  },
  'service_adviser': {
    notEmpty: true,
    errorMessage: 'Service adviser is required.',
    isValidObjectID: {
      errorMessage: 'Service adviser id is not valid.'
    }
  },
  'start_time': {
    notEmpty: true,
    errorMessage: 'Start time is required.',
    isLength: {
      options: {
        min: 0,
        max: 23
      }
    }
  },
  'end_time': {
    notEmpty: true,
    errorMessage: 'End time is required.',
    isLength: {
      options: {
        min: 0,
        max: 23
      }
    }
  },
  'repeats': {
    matches: {
      options: [/\b(?:none|daily|weekly|monthly)\b/],
      errorMessage: "Invalid repeats."
    }
  }
};
module.exports = schema;
