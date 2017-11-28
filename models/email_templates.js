const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const tableSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  identifier: {
    type: String,
    unique: true
  },
  description: String,
  subject: String,
  body: String,
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
module.exports = mongoose.model('Email_templates', tableSchema);
