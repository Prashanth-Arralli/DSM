const usersModel = require(MODELS + 'users');
const isUserAvailable = (field, roles, title) => {
  return async(req, res, next) => {
    try {
      if (!req.body[field]) return next(new Error(field + ' field is missing.'));
      let _id = req.body[field];
      let status = true;
      let user = await usersModel.findOne({
        _id,
        roles,
        status
      });
      if (user === null) throw new Error(title + ' is not available.');
      return next();
    } catch (ex) {
      return next(ex);
    }
  };
};
module.exports = {
  isUserAvailable
}
