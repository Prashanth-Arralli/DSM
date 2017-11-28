const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  plan: {
    type: Schema.Types.ObjectId,
    Ref: 'Plan'
  },
  user: {
    type: Schema.Types.ObjectId,
    Ref: 'User'
  },
  price: {
    type: Number,
    default: 0
  },
  transaction_id: String,
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
  starts: Date,
  ends: Date,
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
}
tableSchema.loadClass(PlanClass);
module.exports = mongoose.model('Purchase_plan_history', tableSchema);