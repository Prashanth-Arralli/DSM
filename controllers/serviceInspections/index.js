const usersModel = require(MODELS + 'users');
const vehiclesModel = require(MODELS + 'vehicles');
const socialProviderService = require(SERVICES + 'socialProvider');
const config = require('config');
const mailServices = require(SERVICES + 'mail');
const smsServices = require(SERVICES + 'sms');


const login = async (req, res, next) => {
  let user;
  let email = req.body.email;
  let password = req.body.password;

  try {
    user = await usersModel.doLogin(email, password, config.get('service​InspectionRole'));
    console.log(user);
    return res.sendResponse(user, 'User has been successfully logged in.');
  } catch (ex) {
    return next(ex);
  }
};

const register = async (req, res, next) => {
  let user;
  try {
    user = await usersModel.registerUser(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.phone
    );
    return res.sendResponse(user, 'User has been successfully registered.');
  } catch (ex) {
    return next(ex);
  }
};
const forgotPassword = async (req, res, next) => {
  let user;
  let email = req.body.email;
  try {
    user = await usersModel.generateForgotToken(email, config.get('service​InspectionRole'));
    mailServices.forgotPasswordNotification(user.email, user); //notify user
    return res.sendResponse(user, 'Successfully send mail your email id.');
  } catch (ex) {
    return next(ex);
  }
};
const resetPassword = async (req, res, next) => {
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
  register,
  forgotPassword,
  resetPassword
}
