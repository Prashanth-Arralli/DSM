const recallModel = require(MODELS + 'recalls');
const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const commonHelper = require(HELPERS + 'common');
const mailHelper = require(HELPERS + 'mail');
const lkpRecallModel = require(MODELS + 'def_nhtsa_recall');
const getRecalls = async(req, res, next) => {
  let _id = req.query.vin;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id
    })
    if (vehicle === null) throw new Error('Vehicle not found.');
    let recalls = await lkpRecallModel.paginateRecalls(vehicle.vehicle_id);
    let count = recalls.length;
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
    let recall = await lkpRecallModel.findOne({
      _id
    });
    if (!recall) throw new Error('Recall is not found.');
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
    let vehicle = vehiclesModel.findOne({
      vehicle_id: recalls.vehicle_id
    }).select('vin user dealer')
    if (vehicle) {
      mailHelper.sendMail('RecallNotificationForAdviser', {
        'user_name': req.user.name,
        'user_email': req.user.email,
        'vin': vehicle.vin,
        'dealer': vehicle.dealer,
        'marketing_email': true
      });
    }
    res.sendResponse({
      recalls
    }, 'Recalls has been requested successfully.');
  } catch (ex) {
    next(ex);
  }
};
const scheduleRecall = async(req, res, next) => {
  let _id = req.body.recalls;
  try {
    let recall = await lkpRecallModel.count({
      _id,
      'recall_status.status': 2
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
    let vehicle = vehiclesModel.findOne({
      vehicle_id: recalls.vehicle_id
    }).select('vin user dealer')
    if (vehicle) {
      mailHelper.sendMail('RecallNotificationForAdviser', {
        'user_name': req.user.name,
        'user_email': req.user.email,
        'vin': vehicle.vin,
        'dealer': vehicle.dealer,
        'marketing_email': true
      });
    }
    req.body.dealer = recalls.dealer;
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
const getReadyRecalls = async(req, res, next) => {
  try { 
    let recalls = await lkpRecallModel.paginateReadyRecalls();
    let count = recalls.length;
    res.sendResponse({
      recalls,
      count
    }, 'Recalls has been fetched successfully.');
  } catch (ex) {
    next(ex);
  }
};
const closeCompleteRecall = async(req, res, next) => {
  let _id = req.params.id;
  try {
    let recall = await lkpRecallModel.findOne({
      _id,
    });
    if (!recall) throw new Error('Recall is not found.');
    else if(recall.recall_status.status != 6) throw new Error('Recall is not completed.');
    let recalls = await lkpRecallModel.findOneAndUpdate({
      _id
    }, {
      show: false
    });
    res.sendResponse({
      recalls
    }, 'Recalls has been clsoed successfully.');
  } catch (ex) {
    next(ex);
  }
};
module.exports = {
  getRecalls,
  scheduleRecall,
  requestRecall,
  getReadyRecalls,
  closeCompleteRecall
};
