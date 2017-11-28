const usersModel = require(MODELS + 'users')
const config = require('config');
const mailServices = require(SERVICES + 'mail');

const login = async(req, res, next) => {
    let users;
    let email = req.body.email;
    let password = req.body.password;
    try {
        users = await usersModel.doLogin(email, password, config.get('adminRole'));
        return res.sendResponse(users, 'Admin has successfully logged in.');
    } catch (ex) {
        return next(ex);
    }
};
const forgotPassword = async(req, res, next) => {
    let user;
    let email = req.body.email;
    try {
        user = await usersModel.generateForgotToken(email, config.get('adminRole'));
        mailServices.forgotPasswordNotification(user.email, user); //notify user
        return res.sendResponse(user, 'Successfully send mail your email id.');
    } catch (ex) {
        return next(ex);
    }
};
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
module.exports = {
    login,
    forgotPassword,
    resetPassword
}
