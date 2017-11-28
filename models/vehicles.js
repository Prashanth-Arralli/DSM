const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const vinsModel = require(MODELS + 'vin');
const vinMocks = require(MODELS + 'vin_mocks');
const tableSchema = new Schema({
  vin: {
    type: String,
    required: true,
    index: true
  },
  name: String,
  vehicle_id: String,
  market: String,
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  location: {
    type: [Number],
    index: '2d'
  },
  lifetime_value: {
    type: Number,
    default: 0
  },
  car_value: {
    type: Number,
    default: 0
  },
  mileage: {
    type: Number,
    default: 0
  },
  loyalty: {
    type: Number,
    default: 0
  },
  buyback_value: {
    type: Number,
    default: 0
  },
  value_shopper: {
    type: Number,
    default: 0
  },
  spend: {
    type: Number,
    default: 0
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  vinAuditValue: {
    type: Schema.Types.Mixed
  },
  details: {
    type: Schema.Types.Mixed
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
class VehicleClass {
  get icon() {
    return this.picture.cdn_url || this.picture.url || config.get('defaultVehiclePicture');
  }
  get MAKE() {
    return this.details ? this.details.make : 'Unknown';
  }
  get MODEL() {
    return this.details ? this.details.model : 'Unknown';
  }
  get YEAR() {
    return this.details ? this.details.year : 'Unknown';
  }
  static async getVehiclesByUserID(user) {
    return await this.find({
      user
    }).select('-__v').exec();
  }
  static async addVehicles(vehicles) {
    return await this.insertMany(vehicles);
  }
  static async isVinAlreadyAvailable(vins) {
    for (let vin of vins) {
      let vehicle = await this.findOne({
        "vin": {
          "$regex": vin,
          "$options": "i"
        }
      });
      if (vehicle) {
        return {
          vin
        };
      }
    }
    return null;
  }

  static async getYears() {
    let _q = this.aggregate()
      .group({
        "_id": "$details.year"
      })
      .group({
        "_id": null,
        "years": {
          $push: "$_id"
        }
      })
      .project({
        "years": 1
      })
    return _q.exec();
  }

  static async getModels() {
    let _q = this.aggregate()
      .group({
        "_id": "$details.model"
      })
      .group({
        "_id": null,
        "models": {
          $push: "$_id"
        }
      })
      .project({
        "models": 1
      })
    return _q.exec();
  }

  static async paginateData(where, skip, limit, sort) {
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


tableSchema.loadClass(VehicleClass);
module.exports = mongoose.model('Vehicle', tableSchema);
