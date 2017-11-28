const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const tableSchema = new Schema({
  name: {
    type: String,
  },
  id: {
    type: Number,
  },
  make:{
    type: Schema.Types.ObjectId,
    ref: 'Makes',
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
module.exports = mongoose.model('Models', tableSchema);
