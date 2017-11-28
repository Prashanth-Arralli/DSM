const mongoose = require('mongoose');
const config = require('config');
const Schema = mongoose.Schema;
const commonHelper = require(HELPERS + 'common');
const tableSchema = new Schema({
  VIN_PATTERN: {
    type: String,
    required: true,
    unique: true
  },
  VEHICLE_ID: {
    type: String,
    required: true
  },
  YEAR: Number,
  MAKE: String,
  MODEL: String,
  TRIM: String,
  STYLE: String,
  VEHICLE_TYPE: String,
  BODY_TYPE: String,
  BODY_SUBTYPE: String,
  OEM_BODY_STYLE: String,
  MSRP: Number,
  PLANT: String,
  RESTRAINT_TYPE: String,
  GVW_RANGE: String,
  LENGTH: Number,
  HEIGHT: Number,
  WIDTH: Number,
  WHEELBASE: Number,
  CURB_WEIGHT: Number,
  GROSS_VEHICLE_WEIGHT_RATING: Number,
  GROSS_COMBINED_WEIGHT_RATING: Number,
  TMP_WHEEL_DIA: Number,
  TMP_TANK1_GAL: Number,
  MAX_PAYLOAD: Number,
  TONNAGE: String,
  WIDTH_NO_MIRRORS: Number,
  LENGTH_NO_BUMPERS: Number,
  DEF_ENGINE_ID: String,
  DRIVE_TYPE: String,
  FUEL_TYPE: String,
  DEF_ENGINE_BLOCK: String,
  DEF_ENGINE_CYLINDERS: Number,
  DEF_ENGINE_SIZE: Number,
  ENGINE_SIZE_UOM: String,
  DEF_ENGINE_ASPIRATION: String,
  DEF_TRANS_ID: String,
  DEF_TRANS_TYPE: String,
  DEF_TRANS_SPEEDS: Number,
});
module.exports = mongoose.model('Vin', tableSchema);
