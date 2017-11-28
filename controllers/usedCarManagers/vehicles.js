const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const commonHelper = require(HELPERS + 'common');
const recallModel = require(MODELS + 'recalls');
const urlFetch = require('node-fetch');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const userModel = require(MODELS + 'users');

const config = require('config');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const makeOffer = async(req, res, next) => {
    try {
        let _id = req.params.id;
        let result = await vehiclesModel.findOneAndUpdate({
            _id
        }, req.body, {
            'new': true
        });
        return res.sendResponse({
            result
        }, "offer made successfully");
    } catch (ex) {
        return next(ex);
    }
}

const fetchSingle = async(req, res, next) => {
  let _id = req.params.id;
  let user = req.params.user;
  try {
    let vehicle = await vehiclesModel.findOne({
        _id,
        user
      })
      .select('name email picture vin icon id details mileage lifetime_value is_under_service');
    if (!vehicle) throw new Error('Vehicle not found.');
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
    last_service_date = last_service_date ? last_service_date.service_status.created_at : null;
    const detail = await urlFetch(
      config.get('vinApi.vinAudit.endpoint') +
      "?" +
      commonHelper.makeQueryParams(config.get('vinApi.vinAudit.credentials')) +
      `&vin=${vehicle.vin}`
    );
    let vechicle_value = await detail.json();
    let where = {
      "$or": [{
          "vin": _id
        },
        {
          "$and": [{
              "vehicle_model": vehicle.details.model
            },
            {
              "vehicle_year": vehicle.details.year
            }
          ]
        }
      ],
      "status": true,
      "scheduled_users.id": {
        "$ne": user
      },
      "starts_at": {
        "$lt": new Date()
      },
      "expires_at": {
        "$gt": new Date()
      },
    };
    
    let recalls = await recallModel.getRecalls(where);
    return res.sendResponse({
      vehicle,
      current_appointment,
      vechicle_value,
      last_service_date,
      recalls
    }, 'vehicle has been fecthed successfully.');
  } catch (ex) {
    return next(ex);
  }
};


module.exports = {
    makeOffer,
    fetchSingle
}