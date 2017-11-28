const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const m = require('moment')
const tableSchema = new Schema({
  nhtsa_campaign_number: String,
  nhtsa_recall_id: String,
  vehicle_id: String,
  mfr_campaign_number: String,
  component_description: String,
  report_manufacturer: String,
  manufacturing_start_date: Date,
  manufacturing_end_date: Date,
  status: {
    type: Boolean,
    default: true
  },
  show: {
    type: Boolean,
    default: true
  },
  recall_type_code: String,
  potential_units_affected: String,
  owner_notification_date: Date,
  recall_initiator: String,
  product_manufacturer: String,
  report_received_date: Date,
  record_creation_date: Date,
  regulation_part_number: Schema.Types.Mixed,
  fmvvs_number: Schema.Types.Mixed,
  defect_summary: String,
  consequence_summary: String,
  corrective_action_summary: String,
  notes: String,
  recalled_component_id: String,
  scheduled_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  recall_status: {
    created_at: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      description: String,
      enum: [1 /*'recall not ready for appointment'*/, 2 /*'recall as ready for appointment'*/, 3 /*'recall appointment
      scheduled'*/, 4 /*'recall checked in'*/ , 5 /*'recall progress'*/ , 6 /*'recall completed'*/, 0 /*'request recall repair'*/],
      default: 0
    },
    description: {
      type: String,
      default: 'Request Recall Repair.'
    },
  },
  recall_logs: [{
    created_at: Date,
    description: String,
    status: {
      type: Number,
      enum: [1 /*'recall not ready for appointment'*/, 2 /*'recall as ready for appointment'*/, 3 /*'recall appointment
      scheduled'*/, 4 /*'recall checked in'*/ , 5 /*'recall progress'*/ , 6 /*'recall completed'*/, 0 /*'request recall repair'*/],
      default: 0
    }
  }],
  scheduled_at: {
    type: Date,
    default: null
  },
  requested_at: {
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
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
class RecallClassDef {
  static async paginateRecalls(vid, skip, limit, sort, needCount, vin) {

    let result;
    let q = this.aggregate()
    if (vid) {
      q = q.match({
        'vehicle_id': vid.toString(),
        'show' : true
        // 'recall_status.status': 0,
        // '$and': [{
        //     'owner_notification_date': {
        //       $gte: m(new Date()).startOf('day').toDate()
        //     }
        //   },
        //   {
        //     'owner_notification_date': {
        //       $lte: m(new Date()).endOf('day').toDate()
        //     }
        //   }
        // ]
      });
    }
    q = q.lookup({
      'from': 'vehicles',
      'localField': 'vehicle_id',
      'foreignField': 'vehicle_id',
      'as': 'vehicle'
    })
      .unwind({
        "path": "$vehicle"
      });
    if (vin) {
      console.log('vin')
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
      'defect_summary': 1,
      'consequence_summary': 1,
      'corrective_action_summary': 1,
      'component_description': 1,
      'owner_notification_date': 1,
      'manufacturing_end_date': 1,
      'manufacturing_start_date': 1,
      'description': 1,
      'owner_notification_date': 1,
      'created_at': 1,
      "recall_status":1
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
  static async paginateReadyRecalls(vid, skip, limit, sort, needCount, vin) {

    let result;
    let q = this.aggregate()
    q = q.match({
      'is_scheduled': false,
      'recall_status.status': 2
    });
    q = q.lookup({
      'from': 'vehicles',
      'localField': 'vehicle_id',
      'foreignField': 'vehicle_id',
      'as': 'vehicle'
    })
      .unwind({
        "path": "$vehicle"
      });
    if (vin) {
      console.log('vin')
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
      'vehicle':{
        "details":"$vehicle.details",
        "_id":"$vehicle._id"
      },
      'defect_summary': 1,
      'consequence_summary': 1,
      'corrective_action_summary': 1,
      'component_description': 1,
      'owner_notification_date': 1,
      'manufacturing_end_date': 1,
      'manufacturing_start_date': 1,
      'description': 1,
      'owner_notification_date': 1,
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
  static async paginateAllRecalls(where, skip, limit, sort, needCount, vin) {
    let result;
    let q = this.aggregate()
      .match(where)
      .lookup({
        'from': 'vehicles',
        'localField': 'vehicle_id',
        'foreignField': 'vehicle_id',
        'as': 'vehicle'
      })
      .unwind({
        "path": "$vehicle"
      })
      .lookup({
        'from': 'users',
        'localField': 'vehicle.user',
        'foreignField': '_id',
        'as': 'user'
      })
      .unwind({
        "path": "$user"
      })
      .project({
        'vin': {
          '$cond': [
            '$vehicle.vin',
            '$vehicle.vin',
            'N/A'
          ]
        },
        'vehicle':{
          "details":"$vehicle.details",
          "_id":"$vehicle._id"
        },
        'user':{
          "name":"$user.name",
          "email":"$user.email",
          "phone":"$user.phone",
          "_id" : "$user._id"
        },
        'defect_summary': 1,
        'consequence_summary': 1,
        'corrective_action_summary': 1,
        'component_description': 1,
        'owner_notification_date': 1,
        'manufacturing_end_date': 1,
        'manufacturing_start_date': 1,
        'description': 1,
        'owner_notification_date': 1,
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
  static async paginateRecall(where, skip, limit, sort) {
    let _q = this.find(where);
    if (skip) {
      _q = _q.skip(skip);
    }
    if (limit) {
      _q = _q.limit(limit);
    }
    if (sort) {
      _q = _q.sort(sort);
    }
    return await _q.exec();
  }
}

tableSchema.loadClass(RecallClassDef);
module.exports = mongoose.model('Def_Nhtsa_Recall', tableSchema);
