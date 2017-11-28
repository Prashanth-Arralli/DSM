const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const config = require('config');

const getYears = async(req, res, next) => {
  try {
    let years = await vehiclesModel.getYears();
    return res.sendResponse({
      years: years[0]
    }, 'Years fetched successfully.');
  } catch (ex) {
    return next(ex);
  }  
}

const getModels = async(req, res, next) => {
  try {
    let models = await vehiclesModel.getModels();
    return res.sendResponse({
      models: models[0]
    }, 'Models fetched successfully.');
  } catch (ex) {
    return next(ex);
  }  
}

module.exports = {
  getYears,
  getModels
}