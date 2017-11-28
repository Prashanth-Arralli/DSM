const servicesModel = require(MODELS + 'services');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');
const _m = require('moment');
const OEMRecommend = require(MODELS + 'oem_recommended_maintenance');
const vehicleModel = require(MODELS + 'vehicles');
const appointmentsModel = require(MODELS + 'appointments');
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
      _id: req.params.id,
      user: req.user._id
    }).select('vin vehicle_id mileage details dealer');
    if (vehicle === null) throw new Error('Vehicle not found.');
    let vehicleDate = _m(vehicle.details.year, 'YYYY');
    // where['make'] = vehicle.details.make;
    // where['model'] = vehicle.details.model;
    where['dealer'] = vehicle.dealer;
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
const getServices = async (req, res, next) => {
  try {
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
      vehicleWhere = {
        year: parseInt(vehicleWhere.details.year),
        mileage: parseInt(vehicleWhere.mileage),
        dealer: vehicleWhere.dealer
      };
      delete where.vin;
      where['vehicleWhere'] = vehicleWhere;
    }
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
const topServices = async (req, res, next) => {
  try {
    let where = {};
    if (req.query.start && req.query.end) {
      let start_date = new Date(req.query.start);
      let end_date = new Date(req.query.end);
      where = {
        "booked_at": {
          $gte: start_date,
          $lt: end_date
        },
        "status": 1
      }
    }
    let [
      services,
      count
    ] = await Promise.all([
      appointmentsModel.topServicesCurrentMonth(where),
      appointmentsModel.topServicesCount(where)
    ]);
    return res.sendResponse({
      services,
      count
    }, 'service has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }

}
module.exports = {
  recommendedServices,
  getServices,
  fetchSingle,
  topServices
}
