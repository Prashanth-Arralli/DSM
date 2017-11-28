const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  name: String,
  description: String,
  price: {
    type: Number,
    default: 0
  },
  orginal_price: {
    type: Number,
    default: 0
  },
  features: [String],
  transactional_email: {
    type: Boolean,
    default: true
  },
  transactional_sms: {
    type: Boolean,
    default: true
  },
  marketing_email_count: {
    type: Number,
    default: 0
  },
  marketing_sms_count: {
    type: Number,
    default: 0
  },
  days: {
    type: Number,
    default: 0
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
class PlanClass {
  static async paginateData(
    where,
    skip,
    limit,
    sort
  ) {
    let q = this.find(where)
    if (sort)
      q = q.sort(sort)
    if (skip)
      q = q.skip(skip);
    if (limit)
      q = q.limit(limit);
    return await q.exec();
  }
}
tableSchema.loadClass(PlanClass);
module.exports = mongoose.model('Plan', tableSchema);