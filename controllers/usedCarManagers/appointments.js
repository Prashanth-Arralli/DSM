const appointmentsModel = require(MODELS + 'appointments');
const vehiclesModel = require(MODELS + 'vehicles');
const commonHelper = require(HELPERS + 'common');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const userModel = require(MODELS + 'users');

const _m = require('moment');
const config = require('config');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

const query = async (req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  try {
    let where = {};
    if (req.query.booked_at) {
      let booked_date = new Date(req.query.booked_at);
      where = {
        "booked_at": {
          $gte: booked_date,
          $lt: _m(booked_date).add(1, 'days').toDate()
        },
        "status": 1
      }
    }
    where['vehicle.dealer'] = req.user.dealer;
    let appointments = await appointmentsModel.query(where);
    let count = await appointmentsModel.count(where);
    return res.sendResponse({
      appointments,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}

const fetchSingle = async (req, res, next) => {
  try {
    let _id = ObjectId(req.params.id);
    let where = {
      _id
    };
    console.log(where)
    let appointment = await appointmentsModel.fetchSingle(where);
    let count = await appointmentsModel.count(where);
    appointment = appointment.toObject();
    appointment.vin.nadaData = await xmlRequestHelper.nadaApiRequest({
      vin: appointment.vin.vin,
      dealer: appointment.vin.dealer,
      mileage: appointment.vin.mileage
    });;

    let vehicleInfo = await vehiclesModel.findOne({ "vin": appointment.vin.vin });
    let vuser = await userModel.findOne({
      _id: vehicleInfo.user
    });
    let tradePriceValue = await xmlRequestHelper.kbbRequest({
      vin: appointment.vin.vin,
      zip: vuser.zip,
      userType: "UsedCar",
      mileage: appointment.vin.mileage,
      type: "Consumer",
      dealer: appointment.vin.dealer,
    });
    appointment.vin.kbb = tradePriceValue.tradePriceValue;

    return res.sendResponse({
      appointment,
      count
    }, "Appointment fetched successfully");
  } catch (ex) {
    return next(ex);
  }

}

const searchAppointment = async (req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query, true);
    if (where.key) {
      where["user.name"] = {
        $regex: where.key,
        $options: 'i'
      };
      delete where.key;
    }
    if (where.vin) {
      where["vehicle.vin"] = {
        $regex: where.vin,
        $options: 'i'
      };
      delete where.vin;
    }
    if (where.current_date) {
      where["booked_at"] = {
        "$gte": new Date(req.query.current_date)
      };
      delete where.current_date;
    }
    if (where.booked_at) {
      var booked_date = new Date(req.query.booked_at)
      delete where.booked_at;
      where["booked_at"] = {
        $gte: booked_date,
        $lt: _m(booked_date).add(1, 'days').toDate()
      };
    }
    where['status'] = 1;
    let appointments = await appointmentsModel.search(where,
      skip,
      limit,
      sort);
    let count = await appointmentsModel.count(where);
    return res.sendResponse({
      appointments,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}

module.exports = {
  query,
  fetchSingle,
  searchAppointment
}
