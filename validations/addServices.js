var schema = {
    'name': {
        notEmpty: true,
        errorMessage: 'Offer name is required.'
    },
    'amount': {
        notEmpty: true,
        errorMessage: 'Offer must have a price'
    }
};
module.exports = schema;