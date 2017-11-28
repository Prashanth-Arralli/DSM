const usersModel = require(MODELS + 'users');
const commonHelper = require(HELPERS + 'common');
const _m = require('moment');
const config = require('config');

const fetchSingle = async (req, res, next) => {
  let where = {};
  where['_id'] = req.params.id;
  try {
    let user = await usersModel.findOne(where)
      .select('name email icon picture id roles phone address zip');
    return res.sendResponse({
      user
    }, 'user has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
}
const updateSingle = async (req, res, next) => {
  let where = {};
  let data = {};
  let {
    name,
    phone,
    address,
    zip
  } = req.body;
  where['_id'] = req.params.id;
  where['dealer'] = req.user.dealer;
  try {
    let user = await usersModel.findOneAndUpdate(where, {
      name,
      phone,
      address,
      zip
    }, {
        new: true
      })
      .select('name email icon picture id roles phone address zip');
    return res.sendResponse({
      user
    }, 'user has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
}
const getUsers = async (req, res, next) => {
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
    let users = await usersModel.query(Object.assign({},where),
      skip,
      limit,
      sort);
    let count = await usersModel.countUser(where);
    return res.sendResponse({
      users,
      count
    }, "users fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}

module.exports = {
  fetchSingle,
  updateSingle,
  getUsers
}
