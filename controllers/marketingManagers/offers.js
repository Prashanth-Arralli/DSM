const offersModel = require(MODELS + 'offers');
const servicesModel = require(MODELS + 'services');
const imageModel = require(MODELS + 'mock_images');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const add = async(req, res, next) => {
  user = req.user.id;
  req.body.created_by = req.user.id;
  try {
    let offer = await new offersModel(req.body).save();
    return res.sendResponse({
      offer
    }, 'offer has been added successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const remove = async(req, res, next) => {
  // let _id = req.params.id;
  // let created_by = req.user.id;
  // try {
  //   let offer = await offersModel.remove({
  //     _id,
  //     created_by
  //   });
  //   return res.sendResponse({
  //     _id
  //   }, 'offer has been removed successfully.');
  // } catch (ex) {
  //   return next(ex);
  // }

  let _id = req.params.id;
  let created_by = req.user.id;

  req.body.status = false;

  try {
    let offer = await offersModel.findOneAndUpdate({
        _id,
        // created_by
      },
      req.body, {
        new: true
      });
    offer = offer.toObject();
    return res.sendResponse({
      offer
    }, 'offer has been deleted successfully.');
  } catch (ex) {
    return next(ex);
  }

};
const query = async(req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  try {
    if (req.query.current_date) {
      where = {};
      where['$and'] = [{
          'starts_at': {
            '$lte': new Date(req.query.current_date)
          }
        },
        {
          'expires_at': {
            '$gte': new Date(req.query.current_date)
          }
        }
      ]
    }
    if (req.query.scheduled_date) {
      where = {};
      where['$and'] = [{
          'starts_at': {
            '$gte': new Date(req.query.scheduled_date)
          }
        }
      ]
    }
    where['status'] = true;
    // where['created_by'] = ObjectId(req.user.id);
    console.log(where)
    let offers = await offersModel.paginateData(
      where,
      skip,
      limit,
      sort
    );

    let count = await offersModel.count(where);
    return res.sendResponse({
      offers,
      count
    }, 'offers has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const update = async(req, res, next) => {
  let _id = req.params.id;
  let created_by = req.user.id;
  try {
    let offer = await offersModel.findOneAndUpdate({
        _id,
        // created_by
      },
      req.body, {
        new: true
      });
    offer = offer.toObject();
    return res.sendResponse({
      offer
    }, 'offer has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};

const fetchImages = async(req, res, next) => {

  try {
    let images = await imageModel.find({}).sort('-created_at').limit(8);

    return res.sendResponse({
      images
    }, 'Images has been fetched successfully.');

  } catch (ex) {
    return next(ex);
  }
}

const fetchSingle = async(req, res, next) => {
  let _id = req.params.id;
  let created_by = req.user.id;
  try {
    let offer = await offersModel.findOne({
        _id,
        // created_by
      })
      .populate('services')
      .select('name icon price original_price discount discount_type services starts_at expires_at long_description description picture id vehicle_year year_clause mileage_clause vehicle_mileage show_case');
    return res.sendResponse({
      offer,
    }, 'offer has been fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  add,
  remove,
  query,
  update,
  fetchSingle,
  fetchImages
}