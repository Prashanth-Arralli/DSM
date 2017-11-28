const userModel = require(MODELS + 'users');
const commonHelper = require(HELPERS + 'common');
const config = require('config');


const query = async(req, res, next) => {
  let _id = req.user.id
  try {
    let user = await userModel.findOne({
      _id
    }).select('name email icon id phone picture address zip address');
    user = user.toObject();
    delete user.picture;
    return res.sendResponse({
      user
    }, 'Profile has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const update = async(req, res, next) => {
  delete req.body.email;
  delete req.body.password;
  delete req.body.accesstokens;
  delete req.body.forgot_password;
  delete req.body.roles;
  let _id = req.user.id;
  try {
    let user = await userModel.findOneAndUpdate({
        _id
      },
      req.body, {
        new: true
      }).select('name email icon id phone picture address zip address');
    user = user.toObject();
    delete user.picture;
    return res.sendResponse({
      user
    }, 'Profile has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const changePassword = async(req, res, next) => {
  if (req.body.cpassword !== req.body.password) {
    return next(Error("Confirm password is not valid"));
  }
  let user;
  let password = req.body.password;
  let old_password = req.body.old_password;
  let _id = req.user.id;
  try {
    user = await userModel.changePassword(_id, old_password, password);
    return res.sendResponse(user, 'Your password changed successfully.');
  } catch (ex) {
    return next(ex);
  }
}

module.exports = {
  query,
  update,
  changePassword
}
