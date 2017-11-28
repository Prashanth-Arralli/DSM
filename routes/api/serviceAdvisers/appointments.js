const express = require('express');
const router = express.Router();
const validation = require(VALIDATIONS + 'index');
const adviserAppointmentController = require(CONTROLLERS + 'serviceAdvisers/appointments');
const fileMiddleware = require(MIDDLEWARES + 'file');
const usersMiddleware = require(MIDDLEWARES + 'users');
const servicesMiddleware = require(MIDDLEWARES + 'service');
const offersMiddleware = require(MIDDLEWARES + 'offer');
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');

router.get('/', adviserAppointmentController.query);

router.post('/',
  (req, res, next) => {
    if (!req.body.services && !req.body.offers)
      return next(new Error('Services or Offers should be present.'));
    //adding predefined data
    req.body.price = 0;
    req.body.created_by = req.user._id;
    req.body.service_status = {
      "description": "Your appointment is not yet been confirmed.",
      "status": 1,
      "created_at": new Date()
    };
    req.body.service_logs = [{
      "description": "Your appointment is not yet been confirmed.",
      "status": 1,
      "created_at": new Date()
    }]
    req.body.booked_at = new Date(req.body.booked_at || req.query.booked_at);
    req.body.booked_at_string = req.body.booked_at.toISOString();
    req.body.type = 2;
    next();
  },
  // appntmntsMiddleware.checkForFutureAppointment,
  // appntmntsMiddleware.isSlotAvailable,
  servicesMiddleware.isServicesExist,
  offersMiddleware.isOffersExist,
  offersMiddleware.excludeServicesByOffer,
  servicesMiddleware.getCostForServices,
  offersMiddleware.getCostForOffers,
  adviserAppointmentController.bookAppointment
);

router.get('/history', adviserAppointmentController.getHistory);

router.get('/search', adviserAppointmentController.searchAppointment);

router.get('/slots',
  adviserAppointmentController.getAppntmntSlts
);

router.get('/invoice/:id',
  adviserAppointmentController.getInvoice
);
router.put('/recall/:id',
fileMiddleware.imgUpload("signatures").fields([{
  name: 'check_in_signature'
}]),
fileMiddleware.assignImageDataToBody("fields", ["check_in_signature"]),
validation.validate('updateAppointment'),
(req, res, next) => {
  req.body.price = 0;
  req.body.offers = req.body.offers ? req.body.offers : [];
  req.body.services = req.body.services ? req.body.services : [];
  delete req.body.type;
  next();
},
adviserAppointmentController.updateRecallAppointment
);
router.get('/:id', adviserAppointmentController.fetchSingle);

router.put('/:id',
  fileMiddleware.imgUpload("signatures").fields([{
    name: 'check_in_signature'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["check_in_signature"]),
  validation.validate('updateAppointment'),
  (req, res, next) => {
    req.body.price = 0;
    req.body.offers = req.body.offers ? req.body.offers : [];
    req.body.services = req.body.services ? req.body.services : [];
    delete req.body.type;
    next();
  },
  // appntmntsMiddleware.isSlotAvailable,
  // servicesMiddleware.isServicesExist,
  offersMiddleware.isOffersExist,
  offersMiddleware.excludeServicesByOffer,
  servicesMiddleware.getCostForServices,
  offersMiddleware.getCostForOffers,
  adviserAppointmentController.updateAppointment
);



module.exports = router;
