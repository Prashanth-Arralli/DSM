var schema = {
  'provider': {
    notEmpty: true,
    errorMessage: 'Provider is required.',
    matches: {
      options: [/\b(?:fb|google|h}")\b/],
      errorMessage: "Invalid provider."
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
  'token': {
    notEmpty: true,
    errorMessage: 'Token is required'
  }
};
module.exports = schema;
