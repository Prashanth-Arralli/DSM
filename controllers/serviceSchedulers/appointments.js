const appointmentsModel = require(MODELS + 'appointments');
const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const servicesModel = require(MODELS + 'services');
const commonHelper = require(HELPERS + 'common');
const _m = require('moment');
const config = require('config');
//Get all appointment slots
const getAppntmntSlts = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let start = _m(new Date(req.body.start || req.query.start));
    let end = _m(new Date(req.body.end || req.query.end));
    let data_range = [];
    while (start.utc() <= end.utc()) {
      data_range.push(new Date(start));
      start.add(1, 'day');
    }
    let slots = await appntmntSltsModel.getAppointments(data_range, undefined, undefined, { dealer: req.user.dealer });
    res.sendResponse({
      slots
    }, 'Appointment slots have been fecthed successfully.')
  } catch (ex) {
    return next(ex);
  }
};
//Get all query appointment slots
const query = async (req, res, next) => {
  let {
    where,
    skip,
    limit,
    sort
  } = commonHelper.paginateQueryAssigner(req.query);
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    if (req.query.booked_at) {
      let booked_date = new Date(req.query.booked_at);
      where = {
        "booked_at": {
          $gte: new Date(booked_date),
          $lt: _m(new Date(booked_date)).add(1, 'days').toDate()
        },
        "status": 1
      }
    } else {
      where = {
        "booked_at": {
          $gte: _m(new Date()).toDate()
        }
      }
    }
    where['dealer'] = req.user.dealer;
    console.log(where);
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
//Get all history appointment slots
const getHistory = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    where['dealer'] = req.user.dealer;
    if (req.query.booked_at) {
      let booked_date = new Date(req.query.booked_at);
      where = {
        "booked_at": {
          $lte: new Date(booked_date)
        }
      }
    }
    let history = await appointmentsModel.query(where);
    let count = await appointmentsModel.count(where);

    return res.sendResponse({
      history,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//Fetch single appointment 
const fetchSingle = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    where['dealer'] = req.user.dealer;
    let id = req.params.id;
    where['_id'] = id;
    let appointment = await appointmentsModel.fetchSingle(where);
    let count = await appointmentsModel.count(where);

    return res.sendResponse({
      appointment,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//Update appointment slots 
const updateAppointment = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    where['dealer'] = req.user.dealer;
    let _id = req.params.id;
    let status = req.body.status
    let description = req.body.description;
    let delivery_time = req.body.delivery_time;
    let body = {};
    if (status) {
      let status_entry = {};
      status_entry = {
        "created_at": new Date(),
        "status": status,
        "description": description || status
      };
      body = {
        "service_adviser": req.user._id,
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
    if (delivery_time) {
      body["delivery_time"] = delivery_time;
    }
    Object.assign(body, req.body);
    let appointment = await appointmentsModel.updateAppointment({
      _id
    },
      body);
    return res.sendResponse({
      appointment
    }, 'Appointment confirmed');

  } catch (ex) {
    return next(ex);
  }
}
//Search appointment slots
const searchAppointment = async (req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query, true);
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    where['dealer'] = req.user.dealer;
    if (req.query) {
      where["user.name"] = {
        $regex: where.key,
        $options: 'i'
      };
      delete where.key;
    }
    where["booked_at"] = {
      $gte: _m(new Date()).toDate()
    };
    where['status'] = 1;
    where['service_status.status'] = 1;
    console.log(where)
    let appointments = await appointmentsModel.sSSearch(where,
      skip,
      limit,
      sort);
    let count = await appointmentsModel.count(where);
    return res.sendResponse({
      appointments,
      count
    }, "users fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//Book appointment slots
const bookAppointment = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let data = req.body;
    data['dealer'] = req.user.dealer;
    let booking_details = await new appointmentsModel(data).save();
    res.sendResponse({
      booking_details
    }, res.locals.excluded_services ?
        res.locals.excluded_services.join(", ") + " excluded." :
        "Appointment created successfully"
    );
  } catch (ex) {
    return next(ex);
  }
  // try {
  //   let booked_at = new Date(req.body.booked_at || req.query.booked_at);
  //   let services = !Array.isArray(req.body.services) ? [req.body.services] : req.body.services;
  //   let price = await servicesModel.getCostForServices(services);
  //   await servicesModel.isServicesExist(services);
  //   let isSlotAvailable = await appntmntSltsModel.isSlotAvailable(booked_at);
  //   let booking_details = await appointmentsModel.bookAppointment(
  //     booked_at,
  //     req.body.user,
  //     req.body.vin,
  //     req.body.services,
  //     price,
  //     req.user.id,
  //     req.body.service_adviser
  //   );
  //   res.sendResponse({
  //     isSlotAvailable,
  //     booking_details
  //   });
  // } catch (ex) {
  //   return next(ex);
  // }
};
//Cancel appointment slots
const cancelAppointment = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    let data = {};
    let _id = req.params.id;
    data.status = 2;
    data['dealer'] = req.user.dealer;
    let appointment = await appointmentsModel.updateAppointment({
      _id
    },
      data);
    console.log(appointment)
    return res.sendResponse({
      appointment
    }, "Appointments Cancel successfully");
  } catch (ex) {
    return next(ex);
  }
}
//Block appointment slots
const blockAppointment = async (req, res, next) => {
  try {
    if (!req.user.dealer) throw new Error('Dealership is not added.');
    let where = {};
    req.body.created_by = req.user._id;
    req.body['dealer'] = req.user.dealer;
    let appointment = await new appointmentsModel(req.body).save();
    return res.sendResponse({
    }, "Availability deleted successfully");
  } catch (ex) {
    return next(ex);
  }
}
module.exports = {
  query,
  fetchSingle,
  updateAppointment,
  getHistory,
  searchAppointment,
  bookAppointment,
  getAppntmntSlts,
  cancelAppointment,
  blockAppointment
}
