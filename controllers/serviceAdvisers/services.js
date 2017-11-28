const servicesModel = require(MODELS + 'services');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');
const _m = require('moment');
const OEMRecommend = require(MODELS + 'oem_recommended_maintenance');
const vehicleModel = require(MODELS + 'vehicles');
//recommended services
const recommendedServices = async (req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  console.log({
    where,
    skip,
    limit,
    sort
  })
  try {
    let vehicle = await vehicleModel.findOne({
      _id: req.params.id
    }).select('vin vehicle_id mileage details.year');
    if (vehicle === null) throw new Error('Vehicle not found.');
    let vehicleDate = _m(vehicle.details.year, 'YYYY');
    console.log(vehicle.mileage)
    let currentDate = _m();
    let diffMonths = currentDate.diff(vehicleDate, 'months');
    let services = await OEMRecommend.paginateData(
      vehicle.vehicle_id,
      vehicle.mileage,
      diffMonths,
      skip,
      limit,
      sort,
      vehicle.details.year
    );
    let count = await OEMRecommend.paginateDataCount(vehicle.vehicle_id,
      vehicle.mileage,
      diffMonths);
    return res.sendResponse({
      services,
      count
    }, 'services has been fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//get services
const getServices = async (req, res, next) => {
  console.log('search check')
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  if (where.key) {
    where["name"] = {
      $regex: where.key,
      $options: 'i'
    };
    delete where.key;
  }
  where['status'] = true;
  if (req.query.vin) {
    let vehicleWhere = await vehicleModel
      .findOne({
        _id: req.query.vin
      })
      .select('details mileage dealer');
    // where['make'] = vehicleWhere.details.make;
    // where['model'] = vehicleWhere.details.model;
    where['dealer'] = vehicleWhere.dealer;
    vehicleWhere = {
      year: parseInt(vehicleWhere.details.year),
      mileage: parseInt(vehicleWhere.mileage)
    };
    delete where.vin;
    where['vehicleWhere'] = vehicleWhere;
  }
  try {
    let services = await servicesModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    delete where.vehicleWhere;
    let count = await servicesModel.count(where);
    return res.sendResponse({
      services,
      count
    }, 'services has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//fetch single service
const fetchSingle = async (req, res, next) => {
  let _id = req.params.id;
  let status = true;
  try {
    let service = await servicesModel.findOne({
      _id,
      status
    }).select('name description icon id amount');
    return res.sendResponse({
      service
    }, 'service has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//exporting modules
module.exports = {
  recommendedServices,
  getServices,
  fetchSingle
}
