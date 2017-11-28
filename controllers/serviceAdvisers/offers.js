const offersModel = require(MODELS + 'offers');
const servicesModel = require(MODELS + 'services');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const vehicleModel = require(MODELS + 'vehicles');
const config = require('config');
//querying all offers
const query = async (req, res, next) => {
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
    where['dealer'] = vehicleWhere.dealer;
    vehicleWhere = {
      year: parseInt(vehicleWhere.details.year),
      mileage: parseInt(vehicleWhere.mileage),
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
//fetching single offer
const fetchSingle = async (req, res, next) => {
  let _id = req.params.id;

  try {
    let services = await servicesModel.find({
      _id
    }).select();
    return res.sendResponse({
      services
    }, 'services has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//exporting all modules
module.exports = {
  query,
  fetchSingle
}
