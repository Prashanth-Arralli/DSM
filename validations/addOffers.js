var schema = {
  'name': {
    notEmpty: true,
    errorMessage: 'Offer name is required.'
  },
  'discount': {
    notEmpty: true,
    errorMessage: 'Discount is required.'
  },
  'discount_type': {
    notEmpty: true,
    errorMessage: 'Discount type is required.'
  },
  'services': {
    notEmpty: true,
    errorMessage: 'Services are required.',
    isArray: {
      errorMessage: 'Services should be an array.',
    }
  },
  'description': {
    notEmpty: true,
    errorMessage: 'Offer description is required.'
  },
  'long_description': {
    notEmpty: true,
    errorMessage: 'Long description description is required.'
  },
  'starts_at': {
    notEmpty: true,
    errorMessage: 'Offer start date is required.'
  },
  'expires_at': {
    notEmpty: true,
    errorMessage: 'Offer end date is required.'
  }

};
module.exports = schema;
