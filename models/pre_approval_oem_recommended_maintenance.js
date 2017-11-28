const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  service_id: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  maintenance_id: {
    type: Number,
    required: true,
    index: true,
  },
  vehicle_id: String,
  vin: String,
  engine_id: String,
  trans_notes: String,
  mileage: {
    type: Number,
    default: 0
  },
  maintenance_name: String,
  maintenance_notes: String,
  schedule_name: String,
  schedule_description: String,
  operating_parameter: String,
  operating_parameter_notes: String,
  maintenance_category: String,
  notes: String,
  interval_type: String,
  unit: String,
  computer_code: String,
  event: String,
  initial_value: Number,
  status: {
    type: Boolean,
    default: true
  },
  value: Number,
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
class PreApprovalRecommendedMaintenance {
  static async getRecalls(where) {
    return await this.find(where).select('_id name description long_description picture expires_at icon');
  }
}

tableSchema.loadClass(PreApprovalRecommendedMaintenance);
module.exports = mongoose.model('Pre_Approval_OEM_Recommended_Maintenance', tableSchema);
