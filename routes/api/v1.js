const express = require('express');
const router = express.Router();
const http = require('http');
const fs = require('fs');
var config = require('config');


//including routes
const adminRoutes = require('./admin/index');
const marketingManagersRoutes = require('./marketingManagers/index');
const serviceAdvisersRoutes = require('./serviceAdvisers/index');
const serviceSchedulersRoutes = require('./serviceSchedulers/index');
const usedCarManagersRoutes = require('./usedCarManagers/index');
const serviceInspectionsRoutes = require('./serviceInspections/index');
const usersRoutes = require('./users/index');
const maintenanceRoutes = require('./maintenance/index');
const plansController = require(CONTROLLERS + 'admin/plans');

const xmlRequestHelper = require(HELPERS + 'xmlRequest');

router.use('/admin', adminRoutes);
router.use('/marketingManagers', marketingManagersRoutes);
router.use('/serviceAdvisers', serviceAdvisersRoutes);
router.use('/serviceSchedulers', serviceSchedulersRoutes);
router.use('/usedCarManagers', usedCarManagersRoutes);
router.use('/serviceInspections', serviceInspectionsRoutes);
router.use('/users', usersRoutes);
router.use('/maintenance', maintenanceRoutes);

router.get('/nadaTest', async(req, res, next) => {
  let response = await xmlRequestHelper.nadaApiRequest(req.query.vin, req.query.mileage);
  res.json(response);
});

router.get('/plans',
    plansController.query
);

module.exports = router;
function download(url) {
  return new Promise((resolve, reject) => {
    var time = (new Date).getTime();
    let fileName = ROOT_FOLDER + '/public/vehiclePictures' + '/' + time + '.jpg'
    const file = fs.createWriteStream(fileName, {
      flags: "wx"
    });

    const request = http.get("http://d1ypc8j62c29y8.cloudfront.net/fullsize/f/f/b/bd59f07aca07d6fffe5dda55483d59410442ebff.png", function (response) {
      resolve(response.pipe(file));
      // return ;
    });
    return request;

  })
}

router.get('/dataOneTest', async(req, res, next) => {

  try {
    let response = await xmlRequestHelper.dataOneRequest(req.query);

    let datOneData = response.decoded_data.query_responses.query_response.us_market_data.us_styles.style.media.evox_stills_single_640px.evox_still_640px.fullsize_path;
    response.picture = {}
    response.picture = {
      cdn_url: null,
      path: null
    }
    let value = await download(datOneData);
    response.picture.path = value.path;
    response.picture.cdn_url = config.get('baseUrl') + '/' + 'public/vehiclePictures/' + value.path.substr(60 + 1, value.path.length);
    res.json(response);
  } catch (ex) {
    return next(ex);
  }

});
router.get('/recommended', async(req, res, next) => {
  try {
    let services = await OEMRecommend.query(req.query.vin, req.query.mileage, req.query.months)
    res.sendResponse(services);
  } catch (ex) {
    next(ex);
  }
});


router.get('/kbb', async(req, res, next) => {
  try {
    let response = await xmlRequestHelper.kbbRequest(req.query.vin , "28806", "UsedCar", 1000, "Consumer");
    res.sendResponse(response);
  } catch (ex) {
    return next(ex);
  }
});
router.get('/make/insert', async(req, res, next) => {
  try {
    let response = await xmlRequestHelper.makeInsert(req.query.vin , "28806", "UsedCar", 1000, "Consumer");
    res.sendResponse(response);
  } catch (ex) {
    return next(ex);
  }
});
router.get('/model/insert', async(req, res, next) => {
  try {
    let response = await xmlRequestHelper.modelInsert(req.query.id , "28806", "UsedCar", 1000, "Consumer");
    res.sendResponse(response);
  } catch (ex) {
    return next(ex);
  }
});


module.exports = router;
