const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  acct: String,
  first_name: String,
  middle_name: String,
  last_name: String,
  address1: String,
  address2: String,
  city: String,
  status: {
    type: Boolean,
    default: true
  },
  state: String,
  zip5: String,
  zip4: String,
  make: String,
  model: String,
  year: String,
  vin: String,
  phone: String,
  lease_expiry: String,
  title_lease_placer: String,
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
class LeaseExpiryClassDef {
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

tableSchema.loadClass(LeaseExpiryClassDef);
module.exports = mongoose.model('Lease_Expiry', tableSchema);
