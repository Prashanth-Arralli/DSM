var schema = {
    'email': {
        notEmpty: true,
        errorMessage: 'Email is required.',
        isEmail: {
            errorMessage: 'Invalid Email.'
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
    },
    'name': {
        notEmpty: true,
        errorMessage: 'name is required.', // Error message for the parameter
        isLength: {
            options: [{
                min: 5
            }],
            errorMessage: 'name must be alteast 6 chars long.' // Error message for the validator, takes precedent over parameter message
        },
    }
};
module.exports = schema;
