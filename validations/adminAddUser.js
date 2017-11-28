var schema = {
    'email': {
        notEmpty: true,
        errorMessage: 'Email is required.',
        isEmail: {
            errorMessage: 'Invalid Email.'
        }
    },
    // 'roles': {
    //     notEmpty: true,
    //     errorMessage: 'Role is required.',
    //     matches: {
    //         options: [/\b(?:user|admin|marketing_manager|used_car_manager|service_scheduler|service_adviser")\b/],
    //         errorMessage: "Invalid role"
    //     }
    // },
    'password': {
        notEmpty: true,
        errorMessage: 'Invalid Password.', // Error message for the parameter
        isLength: {
            options: [{
                min: 5,
                max: 10
            }],
            errorMessage: 'Password must be between 6 and 10 chars long.' // Error message for the validator, takes precedent over parameter message
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
