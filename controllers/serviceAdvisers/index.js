const usersModel = require(MODELS + 'users')
const config = require('config');
const mailServices = require(SERVICES + 'mail');

//service adviser login
const login = async(req, res, next) => {
    let users;
    let email = req.body.email.toLowerCase();
    let password = req.body.password;
    try {
        users = await usersModel.doLogin(email, password, config.get('serviceAdvsrRole'));
        return res.sendResponse(users, 'Service adviser has successfully logged in.');
    } catch (ex) {
        return next(ex);
    }
};
//forgot password.
const forgotPassword = async(req, res, next) => {
    let user;
    let email = req.body.email.toLowerCase();
    try {
        user = await usersModel.generateForgotToken(email, config.get('serviceAdvsrRole'));
        mailServices.forgotPasswordNotification(user.email, user); //notify user
        return res.sendResponse(user, 'Successfully send mail your email id.');
    } catch (ex) {
        return next(ex);
    }
};
//resetting the password.
const resetPassword = async(req, res, next) => {
    if (req.body.cpassword !== req.body.password) {
        return next(Error("Confirm password is not valid"));
    }
    let user;
    let password = req.body.password;
    let token = req.query.token;
    try {
        user = await usersModel.resetPassword(token, password);
        mailServices.resetPasswordNotification(user.email, user); //notify user
        return res.sendResponse(user, 'Your password reset successfully.');
    } catch (ex) {
        return next(ex);
    }
};
//exporting all modules
module.exports = {
    login,
    forgotPassword,
    resetPassword
}
