const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const tableSchema = new Schema({
  from: String,
  fName: String,
  to: String,
  toName: String,
  body: String,
  subject: String,
  sent_status: {
    type:Boolean,
    default: false,
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
module.exports = mongoose.model('Email_logger', tableSchema);
