const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  name: String,
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
  },
  description: String,
  long_description: String,
  original_price: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0
  },
  vin: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  scheduled_users: [{
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    vin: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    created_at: Date
  }],
  status: {
    type: Boolean,
    default: true
  },
  vehicle_model: {
    type: String,
    default: null
  },
  vehicle_year: {
    type: Number,
    default: null
  },
  starts_at: Date,
  expires_at: Date,
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
class RecallClass {
  get icon() {
    return this.picture.cdn_url || this.picture.url || config.get('defaultVehiclePicture');
  }
  static async getRecalls(where) {
    return await this.find(where).select('_id name description long_description picture expires_at icon');
  }
}

tableSchema.loadClass(RecallClass);
module.exports = mongoose.model('Recall', tableSchema);
