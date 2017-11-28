const offersModel = require(MODELS + 'offers');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const vehicleModel = require(MODELS + 'vehicles');
const config = require('config');
const query = async(req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  where['status'] = true;
  where['show_case'] = true;
  where['$and'] = [{
      'starts_at': {
        '$lte': new Date()
      }
    },
    {
      'expires_at': {
        '$gte': new Date()
      }
    }
  ];
  let vehicleWhere;
  if (req.query.vin) {
    vehicleWhere = await vehicleModel
      .findOne({
        _id: req.query.vin
      })
      .select('details mileage dealer');
    c = {
      year: parseInt(vehicleWhere.details.year),
      mileage: parseInt(vehicleWhere.mileage),
      dealer: vehicleWhere.dealer
    };
    delete where.vin;
    where['vehicleWhere'] = vehicleWhere;
  }
  try {
    let offers = await offersModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    if (vehicleWhere) {
      where['vehicleWhere'] = vehicleWhere;
    }
    let count = await offersModel.paginateDataCount(where);
    return res.sendResponse({
      offers,
      count
    }, 'offers has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const fetchSingle = async(req, res, next) => {
  let _id = req.params.id;
  try {
    let offer = await offersModel.findOne({
      _id
    }).select('name icon price original_price discount discount_type expires_at long_description description picture id services').populate('services');
    return res.sendResponse({
      offer,
    }, 'offer has been fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  query,
  fetchSingle
}
