const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');
const vehicleHelper = require(HELPERS + 'vehicle');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
//Query all query of vechicles
const query = async(req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  where['user'] = req.params.id;
  try {
    let vehicles = await vehiclesModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    let count = await vehiclesModel.count(where);
    return res.sendResponse({
      vehicles,
      count
    }, 'vehicles has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//Fetch single vehicle in particular user
const fetchSingle = async(req, res, next) => {
  let _id = req.params.id;
  let user = req.user.id;
  try {
    let vehicle = await vehiclesModel.findOne({
        _id,
        user
      })
      .select('name email picture vin icon id MAKE MODEL lifetime_value is_under_service');
    let current_appointment = await appntmntModel.fetchSingle({
      "vin": _id,
      "user": user,
      "$and": [{
        "service_status.status": {
          "$ne": 1
        }
      }, {
        "service_status.status": {
          "$ne": 4
        }
      }]
    })
    let last_service_date = await appntmntModel.findOne({
      "vin": _id,
      "user": user,
      "service_status.status": 4
    }).sort({
      'booked_at': -1
    });
    last_service_date = last_service_date ? last_service_date.booked_at : null;
    let vechicle_value = [{
      year: 2017,
      value: 8000
    }, {
      year: 2016,
      value: 9000
    }, {
      year: 2015,
      value: 10000
    }, {
      year: 2014,
      value: 10000
    }, {
      year: 2013,
      value: 10000
    }];
    return res.sendResponse({
      vehicle,
      current_appointment,
      vechicle_value,
      last_service_date
    }, 'vehicle has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//Update vehicle informations
const update = async(req, res, next) => {
  let _id = req.params.id;
  let user = req.body.user;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id,
      user
    }).select('vin _id vinAuditValue');
    if (!vehicle) throw new Error('Vehicle not found.');
    let vehicleObj = {
      vin: vehicle.vin,
      mileage: vehicle.mileage,
      dealer: vehicle.dealer
    };
    if (req.body.mileage) {
      vehicleObj['mileage'] = req.body.mileage;
      req.body.vinAuditValue = await vehicleHelper.getVinAuditValue(vehicleObj);
      let nadaValue = await xmlRequestHelper.nadaApiRequest(vehicleObj);
      if (nadaValue.tradeInValues.TradeIn)
        req.body.lifetime_value = nadaValue.tradeInValues.TradeIn;
    } else if (!vehicle.vinAuditValue) {
      req.body.vinAuditValue = await vehicleHelper.getVinAuditValue(vehicleObj);
    }
    vehicle = await vehiclesModel.findOneAndUpdate({
        _id,
        user
      },
      req.body, {
        new: true
      });
    return res.sendResponse({
      vehicle,
      vechicle_value: vehicle.vinAuditValue
    }, 'vehicle has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//Fetch single vehicle
const fetchSingleVehicle = async(req, res, next) => {
  try {
    let _id = req.params.id;
    let vehicles = await vehiclesModel.findOne({
      _id
    })
    return res.sendResponse({
      vehicles,
    }, 'vehicles has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  query,
  fetchSingle,
  update,
  fetchSingleVehicle
}
