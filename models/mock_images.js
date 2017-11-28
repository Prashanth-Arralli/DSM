const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;

const tableSchema = new Schema({
  for: {
    type: String
  },
  status: {
    default: true,
    type: Boolean
  },
  picture: {
    path: String,
    url: String,
    cdn_url: String,
    cdn_id: String
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


class MockImagesClass {


}

tableSchema.loadClass(MockImagesClass);
module.exports = mongoose.model('MockImages', tableSchema);