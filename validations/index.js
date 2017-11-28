const validate = (file) => {
  return async(req, res, next) => {
    try {
      let schema = require(VALIDATIONS + file);
      req.check(schema);
      let result = await req.getValidationResult();
      if (!result.isEmpty()) {
        return next(new Error(result.array()[0].msg))
      }
    }
    catch (ex) {
      return next(ex)
    }
    next();
  }
}
module.exports = {
  validate: validate
}
