const appointmentsModel = require(MODELS + 'appointments');
const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const lkpRecallModel = require(MODELS + 'def_nhtsa_recall');
const servicesModel = require(MODELS + 'services');
const commonHelper = require(HELPERS + 'common');
const _m = require('moment');
const config = require('config');
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
//get appointment slots
const getAppntmntSlts = async (req, res, next) => {
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
//queryig appointments
const query = async (req, res, next) => {
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
    let appointments = await appointmentsModel.query(where, skip, limit, sort);
    let count = await appointmentsModel.getCount(where);
    return res.sendResponse({
      appointments,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//queryig appointments history
const getHistory = async (req, res, next) => {
  try {
    let where = {};
    if (req.query.user)
      where['user'] = ObjectId(req.query.user);
    if (req.query.vin)
      where['vin'] = ObjectId(req.query.vin);
    if (req.query.booked_at) {
      // let booked_date = new Date(req.query.booked_at);
      // where["booked_at"] = {
      //   $lte: new Date(booked_date)
      // };
    }
    where["$or"] = [{
      "service_status.status": 4
    }];
    where['dealer'] = req.user.dealer;
    console.log(where)
    let history = await appointmentsModel.getMyAppointments(where);
    let count = await appointmentsModel.count(where);

    return res.sendResponse({
      history,
      count
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//fetching single appointment
const fetchSingle = async (req, res, next) => {
  try {
    let _id = ObjectId(req.params.id);
    let where = {
      _id
    };
    where['dealer'] = req.user.dealer;
    let appointment = await appointmentsModel.fetchSingle(where);
    if (appointment === null) throw new Error('Appointment not found.');
    let donutData = await appointmentsModel.getStatistics(appointment.user._id, {
      averageVisit: 6,
      averageSpend: 100,
      averageLifeSpan: 7,
      rententionRate: 60,
      profitMargin: 50,
      discountRate: 10,
      customerValue: 600,
      customerSpanValue: 109200,
      lifeTimeValue: 131040
    });
    let count = await appointmentsModel.count(where);
    return res.sendResponse({
      appointment,
      count,
      donutData
    }, "Appointments fetched successfully");
  } catch (ex) {
    return next(ex);
  }

}
//upating single appointment
const updateAppointment = async (req, res, next) => {
  try {
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
    body['dealer'] = req.user.dealer;
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
    }, 'Appointment confirmed');

  } catch (ex) {
    return next(ex);
  }
}
//search appointment by name
const searchAppointment = async (req, res, next) => {
  try {
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
    });
    if (where.key) {
      where["user.name"] = {
        $regex: where.key,
        $options: 'i'
      };
      delete where.key;
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
        $gte: _m(booked_date).startOf('day').toDate(),
        $lte: _m(booked_date).endOf('day').toDate()
      };
    }
    delete where.key;
    where['status'] = 1;
    where['dealer'] = req.user.dealer;
    where['type'] = parseInt(req.query.type);
    let appointments = await appointmentsModel.search(where,
      skip,
      limit,
      sort);
    let count = await appointmentsModel.getCount(where);
    return res.sendResponse({
      appointments,
      count
    }, "users fetched successfully");
  } catch (ex) {
    return next(ex);
  }
}
//book appointment
const bookAppointment = async (req, res, next) => {
  try {
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
};
//get invoice of a appointment
const getInvoice = async (req, res, next) => {
  try {
    let where = {};
    where['dealer'] = req.user.dealer;
    where['_id'] = ObjectId(req.params.id);
    let invoice = await appointmentsModel.getInvoice(where);
    res.sendResponse(invoice, 'Appointment invoice is fetched successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//upating single recall appointment
const updateRecallAppointment = async (req, res, next) => {
  try {
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
    body['dealer'] = req.user.dealer;
    body = Object.assign(body, req.body);
    delete body.status;
    if (!body.offers.length && !body.services.length) {
      delete body.offers;
      delete body.services;
      delete body.price;
    }
    let rid = body.recall;
    delete body.recall;
    let recalls = await lkpRecallModel.findOneAndUpdate({
      _id: rid
    }, {
        scheduled_by: req.user._id,
        scheduled_at: new Date(),
        is_scheduled: true,
        'recall_status.status': body.rstatus,
        'recall_status.description': body.rdescription,
        "$push": {
          'recall_logs': {
            created_at: new Date(),
            status: body.rstatus,
            description: body.rdescription
          }
        }
      });
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
//exporting all modules
module.exports = {
  query,
  fetchSingle,
  updateAppointment,
  getHistory,
  searchAppointment,
  bookAppointment,
  getAppntmntSlts,
  getInvoice,
  updateRecallAppointment
}
