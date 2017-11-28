const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const recallModel = require(MODELS + 'recalls');
const defRecallModel = require(MODELS + 'def_nhtsa_recall');
const lkpRecallModel = require(MODELS + 'def_nhtsa_recall');
const commonHelper = require(HELPERS + 'common');
const vehicleHelper = require(HELPERS + 'vehicle');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const mailServices = require(SERVICES + 'mail');
const urlFetch = require('node-fetch');
const config = require('config');
//change dealer vehicle api
const changeDealer = async (req, res, next) => {
  let _id = req.params.id;
  let dealer = req.body.dealer;
  try {
    let currentDealerVehicle = await vehiclesModel.findOne({
      _id
    });
    if (currentDealerVehicle === null) throw new Error('Vehicle not found.');
    let newDealerVehicle = await vehiclesModel.findOne({
      vin: currentDealerVehicle.vin,
      dealer
    });
    console.log(newDealerVehicle);
    if (!newDealerVehicle) {
      currentDealerVehicle = currentDealerVehicle.toObject();
      currentDealerVehicle.dealer = dealer;
      delete currentDealerVehicle._id;
      newDealerVehicle = await new vehiclesModel(currentDealerVehicle).save();
    }
    return res.sendResponse({
      vehicle: newDealerVehicle,
      vechicle_value: newDealerVehicle.vinAuditValue
    }, 'vehicle has been updated successfully.');
  }
  catch (ex) {
    return next(ex);
  }
};
//add vehicle api
const add = async (req, res, next) => {
  let user = req.user.id;
  try {
    let vins = Array.isArray(req.body.vehicles) ? req.body.vehicles : [req.body.vehicles];
    vins = vins.map(v => {
      v.user = req.user._id;
      return v;
    });
    let vehicle = await vehiclesModel.addVehicles(vins);
    // vehicle = vehicle.toObject();
    return res.sendResponse({
      vehicle
    }, 'vehicle has been added successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const remove = async (req, res, next) => {
  let _id = req.params.id;
  let user = req.user.id;
  try {
    let vehicle = await vehiclesModel.remove({
      _id,
      user
    });
    return res.sendResponse({
      _id
    }, 'vehicle has been removed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const query = async (req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  where['user'] = req.user.id;
  try {
    let vehicles = await vehiclesModel.paginateData(
      where,
      skip,
      limit,
      sort
    );
    console.log(vehicles)
    let count = await vehiclesModel.count(where);
    return res.sendResponse({
      vehicles,
      count
    }, 'vehicles has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const update = async (req, res, next) => {
  let _id = req.params.id;
  let user = req.user.id;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id,
      user
    }).select('vin _id vinAuditValue mileage dealer');
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
      console.log(nadaValue.tradeInValues)
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
const fetchSingle = async (req, res, next) => {
  let _id = req.params.id;
  let user = req.user.id;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id,
      user
    })
      .select('name vehicle_id email dealer picture vin icon id vinAuditValue details mileage lifetime_value is_under_service buyback_value');
    if (!vehicle) throw new Error('Vehicle not found.');
    if (!vehicle.vinAuditValue) {
      const detail = await vehicleHelper.getVinAuditValue(vehicle.vin, vehicle.mileage);
      let vinAuditValue = await detail.json();
      vehicle = await vehiclesModel.findOneAndUpdate({
        _id,
        user
      }, {
          vinAuditValue
        }, {
          new: true
        })
    }
    let current_appointment = await vehicleHelper.getCurrentAppointent(_id);
    let last_service_date = await appntmntModel.findOne({
      "vin": _id,
      "user": user,
      "service_status.status": 4
    }).sort({
      'booked_at': -1
    });
    last_service_date = last_service_date ? last_service_date.service_status.created_at : null;
    let recalls = await lkpRecallModel.paginateRecalls(vehicle.vehicle_id);
    return res.sendResponse({
      vehicle,
      current_appointment,
      vechicle_value: vehicle.vinAuditValue,
      last_service_date,
      recalls
    }, 'vehicle has been fecthed successfully.');
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
  changeDealer
}
