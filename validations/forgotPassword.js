var schema = {
    'email': {
        notEmpty: true,
        errorMessage: 'Email is required.',
        isEmail: {
            errorMessage: 'Invalid Email.'
        }
    }
};
module.exports = schema;
