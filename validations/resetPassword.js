var schema = {
    'password': {
        notEmpty: true,
        errorMessage: 'New Password is required.', // Error message for the parameter
        isLength: {
            options: [{
                min: 5,
                max: 10
            }],
            errorMessage: 'Must be between 6 and 10 chars long.' // Error message for the validator, takes precedent over parameter message
        },
    },
    'cpassword': {
        notEmpty: true,
        errorMessage: 'Confirm Password is required.', // Error message for the parameter
        // equals:  "field:password",
        // errorMessage: 'New password and confirm password not match.',
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
