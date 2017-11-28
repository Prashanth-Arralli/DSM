const usersModel = require(MODELS + 'users');
const config = require('config');
const mailServices = require(SERVICES + 'mail');
//Login service schduler
const login = async(req, res, next) => {
  let user;
  let email = req.body.email;
  let password = req.body.password;
  console.log(config.get('serviceSchdlrRole'))
  try {
    user = await usersModel.doLogin(email, password, config.get('serviceSchdlrRole'));
    return res.sendResponse(user, 'User has been successfully logged in.');
  } catch (ex) {
    return next(ex);
  }
};
//Register service schduler
const register = async(req, res, next) => {
  let user;
  try {
    user = await usersModel.registerUser(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.phone,
      req.body.address,
      req.body.zip,
      req.body.platform,
      config.get('serviceSchdlrRole')
    );
    // user['vehicles'] = await vehiclesModel.addVehicles(user.id, req.body.vehicles);
    return res.sendResponse(user, 'User has been successfully registered.');
  } catch (ex) {
    return next(ex);
  }
};
//social login
const socialLogin = async(req, res, next) => {
  try {
    let profile = await socialProviderService.getProfileData(req.body.provider, req.body.token);
    let user = await usersModel.loginUserBySocialProvider(profile.id, req.body.provider, req.body.platform);
    return res.sendResponse(user, 'User has been successfully logged in.');
  } catch (ex) {
    next(ex);
  }
};
const socialRegister = async(req, res, next) => {
  try {
    let profile = await socialProviderService.getProfileData(req.body.provider, req.body.token);
    if (!profile.email || profile.email === '') {
      return res.json({
        body: profile,
        statusCode: 500,
        message: 'Email is required',
        statusText: 'fail',
      });
    }
    let picture = profile.picture;
    let provider = req.body.provider;
    delete profile.picture;
    profile['picture.url'] = picture;
    profile['picture.cdn_url'] = picture;
    profile['social_identifier'] = {};
    profile['social_identifier'][provider] = profile.id;
    let user = await usersModel.registerUserBySocialProvider(profile, req.body.platform);
    return res.sendResponse(user, 'User has been successfully registered.');
  } catch (ex) {
    next(ex);
  }
}
//Forgot password reset mail
const forgotPassword = async(req, res, next) => {
  let user;
  let email = req.body.email;
  try {
    user = await usersModel.generateForgotToken(email, config.get('serviceSchdlrRole'));
    mailServices.forgotPasswordNotification(user.email, user); //notify user
    return res.sendResponse(user, 'Successfully send mail your email id.');
  } catch (ex) {
    return next(ex);
  }
};
//Reset Password 
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
  register,
  socialLogin,
  socialRegister,
  forgotPassword,
  resetPassword
}
