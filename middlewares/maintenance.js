const settingsModel = require(MODELS + 'settings');
const OEMRecommend = require(MODELS + 'oem_recommended_maintenance');
const defRecallModel = require(MODELS + 'def_nhtsa_recall');
const config = require('config');
const mongoose = require('mongoose');

exports.checkMaintanceToken = async(req, res, next) => {
  if (!req.query.token)
    return next(new Error('Token is not found.'));
  try {
    let settings = await settingsModel.findOne({
      'maintenance.token': req.query.token
    })
    if (settings == null) return next(new Error('Token is not vaild.'));
    next();
  } catch (ex) {
    return next(ex);
  }
};
exports.addRecalls = (req, res, next) => {
  try {
    if (req.body.vehicles) {
      defRecallModel.remove({
        vehicle_id: x.vehicle_id
      }, (err, removed) => {
        console.log(`${new Date()} Recall Removing Existing data: ${removed}. vehicle id ${x.vehicle_id}.`)
        for (x of req.body.vehicles) {
          let data;
          if (!x.recalls || !x.recalls.recall) continue;
          x.recalls = Array.isArray(x.recalls.recall) ? x.recalls.recall : [x.recalls.recall];
          data = x.recalls.map((item) => {
            item.manufacturing_start_date = item.manufacturing_start_date === '0000-00-00' ?
              new Date() : item.manufacturing_start_date;
            item.manufacturing_end_date = item.manufacturing_end_date === '0000-00-00' ?
              new Date() : item.manufacturing_end_date;
            item.owner_notification_date = item.owner_notification_date === '0000-00-00' ?
              new Date() : item.owner_notification_date;
            item.report_received_date = item.report_received_date === '0000-00-00' ?
              new Date() : item.report_received_date;
            item.record_creation_date = item.record_creation_date === '0000-00-00' ?
              new Date() : item.record_creation_date;
            item.vehicle_id = x.vehicle_id;
            item.dealer = x.dealer;
            item.recall_logs = [{
              created_at: new Date(),
              status: 0,
              description: 'Request Recall Repair.'
            }];
            return item;
          })
          try {
            defRecallModel.insertMany(data, (err, result) => {
              if (err) {
                console.log(`${new Date()} Recall Insertion Error vehicle id ${x.vehicle_id}.`);
                console.log(err);
              } else
                console.log(`${new Date()} Recall Insertion Succcess:  vehicle id ${x.vehicle_id}.`);
            });
          } catch (ex) {
            console.log(ex)
          };
        }
      });
    }
  } catch (ex) {
    console.log(`${new Date()} Recall Insertion Error exception.`);
  }
  next();
};
exports.addMaintenanceDetails = (req, res, next) => {
  try {
    for (x of req.body.vehicles) {
      if (!x.vehicle_id) continue;
      console.log(`MAINTENANCE ENTER ${new Date()}`)
      DB2.collection('LKP_VEH_ENG_MAINTENANCE').aggregate([{
          '$match': {
            "vehicle_id": parseInt(x.vehicle_id)
          }
        },
        {
          '$lookup': {
            'from': 'DEF_MAINTENANCE',
            'localField': 'maintenance_id',
            'foreignField': 'maintenance_id',
            'as': 'm'
          }
        },
        {
          '$unwind': '$m'
        },
        {
          '$lookup': {
            'from': 'DEF_MAINTENANCE_SCHEDULE',
            'localField': 'maintenance_schedule_id',
            'foreignField': 'maintenance_schedule_id',
            'as': 'ms'
          }
        },
        {
          '$unwind': {
            "path": "$ms",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          '$lookup': {
            'from': 'LKP_VEH_ENG_MAINTENANCE_INTERVAL',
            'localField': 'veh_eng_maintenance_id',
            'foreignField': 'veh_eng_maintenance_id',
            'as': 'vmi'
          }
        },
        {
          '$unwind': {
            "path": "$vmi",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          '$lookup': {
            'from': 'LKP_VEH_ENG_MAINTENANCE_EVENT_COMPUTER_CODE',
            'localField': 'veh_eng_maintenance_id',
            'foreignField': 'veh_eng_maintenance_id',
            'as': 'vmecc'
          }
        },
        {
          '$unwind': {
            "path": "$vmecc",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          '$lookup': {
            'from': 'DEF_MAINTENANCE_INTERVAL',
            'localField': 'vmi.maintenance_interval_id',
            'foreignField': 'maintenance_interval_id',
            'as': 'mi'
          }
        },
        {
          '$unwind': "$mi"
        },
        {
          "$match": {
            "mi.units": {
              "$ne": null
            },
            "mi.intervel_type": {
              "$ne": null
            },
            "mi.intervel_type": {
              "$ne": "Months"
            }
          }
        },
        {
          '$lookup': {
            'from': 'DEF_MAINTENANCE_COMPUTER_CODE',
            'localField': 'vmecc.maintenance_computer_code_id',
            'foreignField': 'maintenance_computer_code_id',
            'as': 'mcc'
          }
        },
        {
          '$unwind': {
            "path": "$mcc",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          '$lookup': {
            'from': 'DEF_MAINTENANCE_EVENT',
            'localField': 'vmecc.maintenance_id',
            'foreignField': 'maintenance_id',
            'as': 'me'
          }
        },
        {
          '$unwind': "$me"
        },
        {
          "$match": {
            "me.event": 'At each maintenance interval.'
          }
        },
        {
          "$project": {
            "_id": 0,
            vehicle_id: "$vehicle_id",
            engine_id: "$engine_id",
            trans_notes: "$trans_notes",
            maintenance_category: "$m.maintenance_category",
            maintenance_id: "$m.maintenance_id",
            maintenance_name: "$m.maintenance_name",
            maintenance_notes: "$m.maintenance_notes",
            schedule_name: "$ms.schedule_name",
            schedule_description: "$ms.schedule_description",
            operating_parameter: "$mop.operating_parameter",
            operating_parameter_notes: "$mop.operating_parameter_notes",
            computer_code: "$mcc.computer_code",
            event: "$me.event",
            interval_type: "$mi.interval_type",
            value: "$mi.value",
            unit: "$mi.units",
            initial_value: "$mi.initial_value",
            dealer: x.dealer
          }
        }
      ], (err, data) => {
        if (err)
          console.log(`${new Date()} OEM Error: ${err}`);
        else {
          try {
            console.log(`MAINTENANCE DATA GATHERED ${new Date()}`)
            OEMRecommend.remove({
              vehicle_id: x.vehicle_id
            }, (err, removed) => {
              console.log(`${new Date()} OEM Removing Existing data: ${removed}. vehicle id ${x.vehicle_id}.`);
              OEMRecommend.insertMany(data, (err, result) => {
                if (err)
                  console.log(`${new Date()} OEM Insertion Error: ${err}. vehicle id ${x.vehicle_id}.`);
                else
                  console.log(`${new Date()} OEM Insertion Succcess: ${result}. vehicle id ${x.vehicle_id}.`);
              });
            });
          } catch (ex) {
            console.log(ex)
          };
        }
      })
    }
  } catch (ex) {
    console.log(`${new Date()} OEM Insertion Error: ${ex}.`);
  }
  next();
};
