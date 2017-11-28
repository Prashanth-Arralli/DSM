const usersModel = require(MODELS + 'users');
const commonHelper = require(HELPERS + 'common');
const config = require('config');

//Get all adviser
const query = async(req, res, next) => {
    try {
        let {
          where,
          skip,
          limit,
          sort
        } = commonHelper.paginateQueryAssigner(req.query, true);
        if (req.query.key) {
          where["name"] = {
            $regex: where.key,
            $options: 'i'
          };
          delete where.key;
        }
        where['dealer'] = req.user.dealer;
        where['roles'] = config.get('serviceAdvsrRole');
        where['dealer'] = req.user.dealer;
        let adviser = await usersModel.find(where);
        let count = await usersModel.count(where);
        return res.sendResponse({
            adviser,
          count
        }, "users fetched successfully");
      } catch (ex) {
        return next(ex);
      }
};
module.exports = {
    query
}
