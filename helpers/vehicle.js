let config = require('config');
let commonHelper = require(HELPERS + 'common');
let appntmntModel = require(MODELS + 'appointments');
var request = require('request');
let urlFetch = require('node-fetch');
const getCurrentAppointent = async (vin) => {
  return await appntmntModel.fetchSingle({
    "vin": vin,
    "$and": [{
      "service_status.status": {
        "$ne": 1
      }
    }, {
      "service_status.status": {
        "$ne": 4
      }
    }]
  });
};
const getVinAuditValue = async (vehicleObj) => {
  try {
    let vehiclePeriod = config.get('vehiclePeriod');
    let credentials = await commonHelper.getDealerSettings(vehicleObj.dealer, 'vinAuditCredentials');
    if (
      !credentials ||
      !credentials.vinAuditCredentials ||
      !credentials.vinAuditCredentials.key ||
      !credentials.vinAuditCredentials.format ||
      !credentials.vinAuditCredentials.period
    )
      throw new Error('Dealer has not configured the configuration.');
    let vehicle = await urlFetch(
      config.get('vinApi.vinAudit.endpoint') +
      "?" +
      commonHelper.makeQueryParams(credentials.vinAuditCredentials) +
      `&vin=${vehicleObj.vin}&mileage=${vehicleObj.mileage}`
    );
    return await vehicle.json();
  }
  catch (ex) {
    return Promise.reject(ex);
  }
}
module.exports = {
  getCurrentAppointent,
  getVinAuditValue
}
