const usersModel = require(MODELS + 'users');
const commonHelper = require(HELPERS + 'common');
const config = require('config');
//Query all users
const query = async (req, res, next) => {
    try {
        let {
          where,
            skip,
            limit,
            sort
        } = commonHelper.paginateQueryAssigner(req.query, true);
        if (req.query.key) {
            where['$or'] = [{
                'name': {
                    $regex: where.key,
                    $options: 'i'
                }
            },
            {
                'phone': {
                    $regex: where.key,
                    $options: 'i'
                }
            },
            {
                'email': {
                    $regex: where.key,
                    $options: 'i'
                }
            }
            ];
            delete where.key;
        }
        where['dealer'] = req.user.dealer;
        where['roles'] = config.get('userRole');
        let user = await usersModel.query(where,
            skip,
            limit,
            sort);
        let count = await usersModel.count(where);
        return res.sendResponse({
            user,
            count
        }, "users fetched successfully");
    } catch (ex) {
        return next(ex);
    }
};
//Fetch single users
const fetchSingle = async (req, res, next) => {
    let _id = req.params.id;
    try {

        let user = await usersModel.findOne({
            _id
        }).select('name email icon id roles phone');
        return res.sendResponse({
            user
        }, 'user has been fecthed successfully.');
    } catch (ex) {
        return next(ex);
    }
};
module.exports = {
    query,
    fetchSingle
}
