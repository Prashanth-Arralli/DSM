const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const appntmntModel = require(MODELS + 'appointments');
const servicesModel = require(MODELS + 'services');
const vehicleModel = require(MODELS + 'vehicles');
const commonHelper = require(HELPERS + 'common');
const _m = require('moment');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const getAppntmntSlts = async(req, res, next) => {
  try {
    let start = _m(new Date(req.body.start || req.query.start));
    let end = _m(new Date(req.body.end || req.query.end));
    let data_range = [];
    while (start.utc() <= end.utc()) {
      data_range.push(new Date(start));
      start.add(1, 'day');
    }
    let slots = await appntmntSltsModel.getAppointments(data_range);
    res.sendResponse({
      slots
    }, 'Appointment slots have been fecthed successfully.')
  } catch (ex) {
    return next(ex);
  }
};
const bookAppointment = async(req, res, next) => {
  console.log(req.body)
  try {
    let data = req.body;
    let vin = data.vin;
    let vehicle = await vehicleModel.findOne({_id:vin}).select('dealer');
    console.log(vehicle)
    if(!vehicle) throw new Error('Vehicle not found.')
    data['dealer'] = vehicle.dealer;
    let booking_details = await new appntmntModel(data).save();
    res.sendResponse({
        booking_details
      }, res.locals.excluded_services ?
      res.locals.excluded_services.join(", ") + " excluded." :
      "Appointment created successfully"
    );
  } catch (ex) {
    return next(ex);
  }
};
const updateAppointment = async(req, res, next) => {
  try {
    let data = req.body;
    // delete data.status;
    if (!data.offers.length && !data.services.length) {
      delete data.offers;
      delete data.services;
      delete data.price;
    }
    if (req.body.status)
      data['status'] = req.body.status == 'cancel' ? 2 : 1;
    let booking_details = await appntmntModel.updateAppointment({
        _id: req.params.id,
        user: req.user.id
      },
      data
    );
    res.sendResponse({
      booking_details
    });
  } catch (ex) {
    return next(ex);
  }
};
const getPastAppointments = async(req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query);
    where['user'] = req.user.id;
    where['service_status.status'] = 4;
    delete where.date;
    console.log(where)
    let appointments = await appntmntModel.getMyAppointments(
      where,
      skip,
      limit,
      sort
    );
    res.sendResponse(appointments, 'Appointments are fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const getMyAppointments = async(req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query);
    where['$and'] = [{
        'booked_at': {
          "$gte": req.query.date ? new Date(req.query.date) : new Date()
        }
      },
      {
        'service_status.status': {
          '$ne': 4
        }
      },
      {
        'status': 1
      },
      {
        'type': {
          '$ne': 3
        }
      },
      {
        'user': ObjectId(req.user.id)
      }
    ];
    delete where.date;
    console.log(new Date(req.query.date))
    let appointments = await appntmntModel.getMyAppointments(
      where,
      skip,
      limit,
      sort
    );
    res.sendResponse(appointments, 'Appointments are fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const fetchSingle = async(req, res, next) => {
  try {
    let where = {};
    where['user'] = req.user.id;
    where['_id'] = req.params.id;
    let appointment = await appntmntModel.fetchSingle(where);
    res.sendResponse(appointment, 'Appointment is fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
const getInvoice = async(req, res, next) => {
  try {
    let where = {};
    where['user'] = ObjectId(req.user.id);
    where['_id'] = ObjectId(req.params.id);
    let appointment = await appntmntModel.getInvoice(where);
    res.sendResponse(appointment, 'Appointment invoice is fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  getAppntmntSlts,
  bookAppointment,
  getMyAppointments,
  fetchSingle,
  updateAppointment,
  getPastAppointments,
  getInvoice
};
