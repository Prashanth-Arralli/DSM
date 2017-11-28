const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const m = require('moment');
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  vehicle_id: String,
  nhtsa_recall_id: String,
  scheduled_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  scheduled_at: {
    type: Date,
    default: null
  },
  is_scheduled: {
    type: Boolean,
    default: false
  },
  is_requested: {
    type: Boolean,
    default: false
  },
  requested_at: {
    type: Date,
    default: null
  },
  is_allowed: {
    type: Boolean,
    default: false
  },
  allowed_at: {
    type: Date,
    default: null
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  created_at: Date,
  updated_at: Date
}, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    toObject: {
      getters: true,
      setters: true
    },
    toJSON: {
      getters: true,
      setters: true
    }
  });
class RecallClassLookup {
  static async paginateRecalls(vid, skip, limit, sort, needCount, vin) {
    let result;
    let q = this.aggregate()
    if (vid) {
      q = q.match({
        '$or': [{
          'vehicle_id': parseInt(vid),
        }],
        'is_scheduled': false
      });
    }
    q = q.lookup({
      'from': 'def_nhtsa_recalls',
      'localField': 'nhtsa_recall_id',
      'foreignField': 'nhtsa_recall_id',
      'as': 'recalls'
    })
    if (vid) {
      q = q.match({
        $and: [{
            'recalls.owner_notification_date': {
              $gte: m(new Date()).startOf('day')
            }
          },
          {
            'recalls.owner_notification_date': {
              $lte: m(new Date()).endOf('day')
            }
          }
        ]
      });
    }
    q = q.lookup({
      'from': 'vehicles',
      'localField': 'vehicle_id',
      'foreignField': 'vehicle_id',
      'as': 'vehicle'
    });
    q = q.unwind('recalls')
      .unwind({
        "path": "$vehicle",
        "preserveNullAndEmptyArrays": true
      });
    if (vin) {
      q = q.match({
        'vehicle.vin': {
          $regex: vin,
          $options: 'i'
        }
      });
    }
    if (needCount) {
      q = q.group({
        '_id': null,
        'count': {
          '$sum': 1
        }
      });
      result = await q.exec();
      return result.length ? result[0].count : 0;
    }
    q = q.project({
      'vin': {
        '$cond': [
          '$vehicle.vin',
          '$vehicle.vin',
          'N/A'
        ]
      },
      'defect_summary': '$recalls.defect_summary',
      'consequence_summary': '$recalls.consequence_summary',
      'corrective_action_summary': '$recalls.corrective_action_summary',
      'component_description': '$recalls.component_description',
      'owner_notification_date': '$recalls.owner_notification_date',
      'manufacturing_end_date': '$recalls.manufacturing_end_date',
      'manufacturing_start_date': '$recalls.manufacturing_start_date',
      'description': '$recalls.component_description',
      'owner_notification_date': '$recalls.owner_notification_date',
      '_id': 1,
      'recall_id': '$recalls._id',
      'created_at': 1
    })
    if (sort) {
      q = q.sort(sort);
    }
    if (skip) {
      q = q.skip(skip);
    }
    if (limit) {
      q = q.limit(limit);
    }
    result = await q.exec();
    return result;
  }
  
}

tableSchema.loadClass(RecallClassLookup);
module.exports = mongoose.model('LKP_Veh_Nhtsa_Recall', tableSchema);
