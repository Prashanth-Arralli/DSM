const vehiclesModel = require(MODELS + 'vehicles');
const xmlRequestHelper = require(HELPERS + 'xmlRequest');
const vehicleHelper = require(HELPERS + 'vehicle');
const http = require('http');
const fs = require('fs');
var config = require('config');


const isVinsAvailable = async(req, res, next) => {
  try {
    req.body.vehicles = Array.isArray(req.body.vehicles) ? req.body.vehicles : [req.body.vehicles];
    let vins = req.body.vehicles.map((v) => {
      if(!v.dealer) throw new Error('Dealership should be added with vehicle.');
      return v.vin
    })
    let vehicles = await vehiclesModel.isVinAlreadyAvailable(vins);
    if (vehicles !== null) {
      throw new Error(vehicles.vin + " already exists in database.")
    }
    return next();
  } catch (ex) {
    return next(ex);
  }
};

function download(url) {
  return new Promise((resolve, reject) => {
    var time = (new Date).getTime();
    let fileName = ROOT_FOLDER + '/public/vehiclePictures' + '/' + time + '.jpg'
    const file = fs.createWriteStream(fileName, {
      flags: "wx"
    });
    const request = http.get('http:' + url, function (response) {
      resolve(response.pipe(file));
    });
    return request;

  })
}

const getVinsInformation = async(req, res, next) => {
  try {
    let vehicles = [];
    for (x of req.body.vehicles) {
      let lifetime_value = 0;
      let mileage = x.mileage = (typeof x.mileage === "string") ?
        parseFloat(x.mileage.replace(',', '')) : x.mileage;
      let response = await xmlRequestHelper.dataOneRequest(x);
      const vinAuditValue = await vehicleHelper.getVinAuditValue(x);
      let vehicleDetail = Array.isArray(response.us_market_data.us_styles.style) ?
        response.us_market_data.us_styles.style[0] :
        response.us_market_data.us_styles.style;
      let picture = {};
      if (vehicleDetail.media) {
        if (vehicleDetail.media.evox_stills_single_640px) {
          let dataOneImage = vehicleDetail.media.evox_stills_single_640px.evox_still_640px.thumbnail_path;
          let value = await download(dataOneImage);
          let path = value.path;
          let cdn_url = config.get('baseUrl') + '/vehiclePictures/' + path.substr(path.lastIndexOf('/') + 1, path.length);
          picture = {
            "cdn_url": cdn_url,
            "url": cdn_url,
            "path": path
          }
        }
      }
      vehicles.push({
        "dealer": x.dealer,
        "vin": x.vin,
        "name": vehicleDetail.name,
        "vehicle_id": vehicleDetail.vehicle_id,
        "complete": vehicleDetail.complete,
        "market": vehicleDetail.market,
        "fleet": vehicleDetail.fleet,
        "details": vehicleDetail.basic_data,
        "spend": (Math.floor(Math.random() * 10) + 1),
        "value_shopper": (Math.floor(Math.random() * 10) + 1),
        "loyalty": (Math.floor(Math.random() * 10) + 1),
        "car_value": (Math.floor(Math.random() * 10) + 1),
        "mileage": mileage,
        "lifetime_value": lifetime_value,
        "vinAuditValue": vinAuditValue,
        "picture": picture,
        "recalls": vehicleDetail.nhtsa_recalls
      });
    }
    req.body.vehicles = vehicles;
    next();
  } catch (ex) {
    return next(ex);
  }
};
module.exports = {
  isVinsAvailable,
  getVinsInformation
}
