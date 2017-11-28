const appointmentsModel = require(MODELS + 'appointments');
const vehiclesModel = require(MODELS + 'vehicles');
const commonHelper = require(HELPERS + 'common');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const userModel = require(MODELS + 'users');

const _m = require('moment');
const config = require('config');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

//query single appointment
const query = async(req, res, next) => {
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
        "service_status.status": 2
      }
    }
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

//fetch single appointment
const fetchSingle = async(req, res, next) => {
  try {
    let _id = ObjectId(req.params.id);
    let where = {
      _id
    };
    let appointment = await appointmentsModel.fetchSingle(where);
    if (appointment === null) throw new Error('Appointment not found.');
    let count = await appointmentsModel.count(where);


    return res.sendResponse({
      appointment,
      count
    }, "Appointment fetched successfully");
  } catch (ex) {
    return next(ex);
  }

}

//upating confirm appointment
const searchAppointment = async(req, res, next) => {
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
    // where['status'] = 1;
      where['service_status.status'] = 2;
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
//upating single appointment
const updateAppointment = async(req, res, next) => {
  try {
    let _id = req.params.id;
    let status = req.body.status
    let description = req.body.description;
    let body = {};
    if (status) {
      let status_entry = {};
      status_entry = {
        "created_at": new Date(),
        "status": status,
        "description": description || status
      };
      body = {
        "service_inspector": req.user._id,
        "service_status": status_entry,
        "$push": {
          "service_logs": status_entry
        }
      };
    }
    if (status == '4') {
      body['summary'] = {
        "title": req.body.summary_title,
        "body": req.body.summary_body
      };
    }
    body = Object.assign(body, req.body);
    delete body.status;
    if (!body.offers.length && !body.services.length) {
      delete body.offers;
      delete body.services;
      delete body.price;
    }
    let appointment = await appointmentsModel.updateAppointment({
        _id
      },
      body);
    return res.sendResponse({
      appointment
    }, 'vehicle inspection report is​ ready​ ​for​ ​viewing');

  } catch (ex) {
    return next(ex);
  }
}

module.exports = {
  query,
  fetchSingle,
  searchAppointment,
  updateAppointment
}
