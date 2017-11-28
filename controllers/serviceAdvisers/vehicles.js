const vehiclesModel = require(MODELS + 'vehicles');
const appntmntModel = require(MODELS + 'appointments');
const commonHelper = require(HELPERS + 'common');
const mailServices = require(SERVICES + 'mail');
const vehicleHelper = require(HELPERS + 'vehicle');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const config = require('config');

const update = async(req, res, next) => {
  let _id = req.params.id;
  try {
    let vehicle = await vehiclesModel.findOne({
      _id
    }).select('vin _id vinAuditValue');
    if (vehicle === null) throw new Error('Vehicle not found.')
    let vehicleObj = {
      vin: vehicle.vin,
      mileage: vehicle.mileage,
      dealer: vehicle.dealer
    };
    if (req.body.mileage) {
      vehicleObj['mileage'] = req.body.mileage;
      req.body.vinAuditValue = await vehicleHelper.getVinAuditValue(vehicleObj);
      let nadaValue = await xmlRequestHelper.nadaApiRequest(vehicleObj);
      if (nadaValue.tradeInValues.TradeIn)
        req.body.lifetime_value = nadaValue.tradeInValues.TradeIn;
    } else if (!vehicle.vinAuditValue) {
      req.body.vinAuditValue = await vehicleHelper.getVinAuditValue(vehicleObj);
    }
    vehicle = await vehiclesModel.findOneAndUpdate({
        _id,
        dealer: req.body.dealer
      },
      req.body, {
        new: true
      });
    return res.sendResponse({
      vehicle,
      vechicle_value: vehicle.vinAuditValue
    }, 'vehicle has been updated successfully.');
  } catch (ex) {
    return next(ex);
  }
};

module.exports = {
  update
}
