const recallModel = require(MODELS + 'recalls');
const vehiclesModel = require(MODELS + 'vehicles');
const commonHelper = require(HELPERS + 'common');
const mailHelper = require(HELPERS + 'mail');
const usersModel = require(MODELS + 'users');
const lkpRecallModel = require(MODELS + 'def_nhtsa_recall');
const appntmntModel = require(MODELS + 'appointments');
//Get recalls
const getRecalls = async (req, res, next) => {
  let _id = req.query.vin;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id
    });
    if (vehicle === null) throw new Error('Vehicle not found.');
    let recalls = await lkpRecallModel.paginateRecalls(vehicle.vehicle_id);
    res.sendResponse({
      recalls
    }, 'Recalls has been fetched successfully.');
  } catch (ex) {
    next(ex);
  }
};
//Schedul the ssingle recall
const scheduleRecall = async (req, res, next) => {
  let _id = req.body.recalls;
  try {
    let recall = await lkpRecallModel.count({
      _id,
      'recall_status.status': 1
    });
    if (!recall) throw new Error('Recall is not found.');
    let recalls = await lkpRecallModel.findOneAndUpdate({
      _id
    }, {
      scheduled_by: req.user._id,
      scheduled_at: new Date(),
      is_scheduled: true,
      'recall_status.status': 3,
      'recall_status.description':'recall appointment scheduled',
      "$push": {
        'recall_logs': {
          created_at: new Date(),
          status: 3,
          description: 'recall appointment scheduled'
        }
      }
    });
    // let vehicle = vehiclesModel.findOne({
    //   vehicle_id: recalls.vehicle_id
    // }).select('vin user')
    // if (vehicle) {
    //   mailHelper.sendMail('RecallNotificationForAdviser', {
    //     'user_name': req.user.name,
    //     'user_email': req.user.email,
    //     'vin': vehicle.vin
    //   });
    // }
    let data = req.body;    
    let booking_details = await new appntmntModel(data).save();
    res.sendResponse({
        booking_details
      }, 
      "Recall appointment created successfully"
    );
    // res.sendResponse({
    //   recalls
    // }, 'Your details have been sent to the dealer.\
    // They will contact you shortly.');
  } catch (ex) {
    next(ex);
  }
};
const getAllRecalls = async (req, res, next) => {
  try {
    let where = {};
    where['dealer'] = req.user.dealer;
    where['recall_status.status'] = 1;
    let recalls = await lkpRecallModel.paginateAllRecalls(where);
    let count = await lkpRecallModel.count(where)
    res.sendResponse({
      recalls,
      count
    }, 'Recalls has been fetched successfully.');
  } catch (ex) {
    next(ex);
  }
};
const scheduleRecallReady = async (req, res, next) => {
  let _id = req.params.id;
  try {
    let recalls = await lkpRecallModel.findOneAndUpdate({
      _id
    }, {
      'recall_status.status': 2,
      'recall_status.description':'recall as ready for appointment',
      "$push": {
        'recall_logs': {
          created_at: new Date(),
          status: 2,
          description: 'recall as ready for appointment'
        }
      }
      });
    res.sendResponse({
      recalls,
    }, 'Recall has been ready to appointment.');
  } catch (ex) {
    next(ex);
  }
};
const conformRecall = async (req, res, next) => {
  try {
    let where = {};
    where['dealer'] = req.user.dealer;
    where['recall_status.status'] = 2;
    let recalls = await lkpRecallModel.paginateAllRecalls(where);
    let count = await lkpRecallModel.count(where)
    res.sendResponse({
      recalls,
      count
    }, 'Recalls has been fetched successfully.');
  } catch (ex) {
    next(ex);
  }
};
const requestRecall = async(req, res, next) => {
  let _id = req.params.id;
  try {
    let recalls = await lkpRecallModel.findOneAndUpdate({
      _id
    }, {
      requested_at: new Date(),
      is_requested: true,
      'recall_status.status': 1,
      'recall_status.description':'recall not ready for appointment',
      "$push": {
        'recall_logs': {
          created_at: new Date(),
          status: 1,
          description: 'recall not ready for appointment'
        }
      }
    });
    let vehicle = await vehiclesModel.findOne({
      vehicle_id: recalls.vehicle_id
    }).select('vin user');
    if (vehicle) {
      let consumer = await usersModel.findOne({
        _id: vehicle.user
      });
      mailHelper.sendMail('RecallNotificationForAdviser', {
        'user_name': consumer.name,
        'user_email': consumer.email,
        'vin': vehicle.vin
      });
    }
    res.sendResponse({
      recalls
    }, 'Recalls has been updated successfully.');
  } catch (ex) {
    next(ex);
  }
};
module.exports = {
  getRecalls,
  scheduleRecall,
  getAllRecalls,
  scheduleRecallReady,
  conformRecall,
  requestRecall
};
