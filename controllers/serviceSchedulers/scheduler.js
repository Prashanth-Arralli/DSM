const appntmntSltsModel = require(MODELS + 'appointmentSlots');
const appntmntModel = require(MODELS + 'appointments');
const _m = require('moment');
const mongoose = require('mongoose');
const commonHelper = require(HELPERS + 'common');
const ObjectId = mongoose.Types.ObjectId;
//Create appointment slots
const createAppntmntSlts = async (req, res, next) => {
  try {
    // let appointment = await appntmntSltsModel.findOneAndUpdate({
    //   service_adviser: req.body.service_adviser
    // },
    //   req.body, {
    //     upsert: true,
    //     setDefaultsOnInsert: true,
    //     new: true
    //   });
    let appointment = await new appntmntSltsModel.insertMany(req.body);
    res.sendResponse({
      insert : req.body.length
    }, 'Appointment slot has been added successfully.')
  } catch (ex) {
    return next(ex);
  }
};
//Get all appointment slots 
const getAppntmntSlts = async (req, res, next) => {
  try {
    if(!req.user.dealer) throw new Error('Dealership not added.')
    let start = _m(new Date(req.body.start || req.query.start));
    let end = _m(new Date(req.body.end || req.query.end));
    let cstart = new Date(start);
    let cend = new Date(end);
    let data_range = [];
    let where = {};
    where['dealer'] = req.user.dealer;
    if (req.query.id) {
      let service_adviser = req.query.id;
      where['service_adviser'] = mongoose.Types.ObjectId(service_adviser);
    }
    while (start.utc() <= end.utc()) {
      data_range.push(new Date(start));
      start.add(1, 'day');
    }
    where['dealer']= req.user.dealer;
    let appointments = await appntmntSltsModel.getAppointments(data_range, cstart, cend, where);
    res.sendResponse({
      appointments
    }, 'Appointment slots have been fecthed successfully.')
  } catch (ex) {
    return next(ex);
  }
};
//Get appointment slots in single adviser
const getAppntmntSltsSingle = async (req, res, next) => {
  try {
    if(!req.user.dealer) throw new Error('Dealership not added.')
    let start = _m(new Date(req.body.start || req.query.start));
    let end = _m(new Date(req.body.end || req.query.end));
    let cstart = new Date(start);
    let cend = new Date(end);
    let data_range = [];
    let where = {};
    if (req.params.id) {
      let service_adviser = req.params.id;
      where['service_adviser'] = mongoose.Types.ObjectId(service_adviser);
      where['dealer'] = req.user.dealer;
      where['$and'] = [
        {
          "starts_on": {
            "$gte": req.query.start + "T00:00:00.000Z"
          }
        },
        {
          "ends_on": {
            "$lte": req.query.end + "T23:00:00.000Z"
          }
        }
      ]

    }
    while (start.utc() <= end.utc()) {
      data_range.push(new Date(start));
      start.add(1, 'day');
    }
    console.log(where)
    let appointments = await appntmntSltsModel.find(where).select('starts_on ends_on');
    res.sendResponse({
      appointments
    }, 'Appointment slots have been fecthed successfully.')
  } catch (ex) {
    return next(ex);
  }
};
//Update single appointment slots
const updateSingleSlts = async (req, res, next) => {
  let _id = req.params.id;
  let dealer = req.user.dealer;
  try {
    let appointments = await appntmntSltsModel.findOneAndUpdate({
      _id,
      dealer
    },
      req.body, {
        new: true
      });
    return res.sendResponse({

    }, 'Appointment has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//Delete the single appointment slots
const deleteSingleSlts = async (req, res, next) => {
  try {
    let data = req.body;
    let dealer = req.user.dealer;
    let slots = await appntmntSltsModel.remove(data);
    return res.sendResponse({
    }, 'Appointment has been removed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
//Get appointment slots
const getMyAppointments = async (req, res, next) => {
  try {
    let {
      where,
      skip,
      limit,
      sort
    } = commonHelper.paginateQueryAssigner(req.query);
    let dealer = req.user.dealer;
    where['dealer'] = req.user.dealer;
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
      'type': {
        '$ne': 3
      }
    },
    {
      'status': 1
    },
    {
      'user': ObjectId(req.params.id)
    },
    {
      'vin': ObjectId(req.params.vin)
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
//Delete slots single adviser
const deleteSlts = async (req, res, next) => {
  try {
    let where = {};
    where['service_adviser'] = mongoose.Types.ObjectId(req.body.service_adviser);
    where['dealer'] = req.user.dealer;
    where['$and'] = [
      {
        "starts_on": {
          "$gte": req.body.starts_on
        }
      },
      {
        "ends_on": {
          "$lte": req.body.ends_on
        }
      }
    ]
    let slots = await appntmntSltsModel.remove(where);
    return res.sendResponse({
      slots
    }, 'Appointment has been removed successfully.');
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  createAppntmntSlts,
  getAppntmntSlts,
  getAppntmntSltsSingle,
  updateSingleSlts,
  deleteSingleSlts,
  getMyAppointments,
  deleteSlts
};
