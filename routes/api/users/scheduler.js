const express = require('express');
const router = express.Router();
const userSchedulerController = require(CONTROLLERS + 'users/scheduler');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
const usersMiddleware = require(MIDDLEWARES + 'users');
const servicesMiddleware = require(MIDDLEWARES + 'service');
const offersMiddleware = require(MIDDLEWARES + 'offer');
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');

router.get('/slots',
  userSchedulerController.getAppntmntSlts
);
router.post('/appointments',
  auth.authenticateAsUser,
  (req, res, next) => {
    if (!req.body.services && !req.body.offers)
      return next(new Error('Services or Offers should be present.'));
    //adding predefined data
    req.body.price = 0;
    req.body.user = req.user._id;
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
    next();
  },
  appntmntsMiddleware.checkForFutureAppointment,
  appntmntsMiddleware.isSlotAvailable,
  servicesMiddleware.isServicesExist,
  offersMiddleware.isOffersExist,
  offersMiddleware.excludeServicesByOffer,
  servicesMiddleware.getCostForServices,
  offersMiddleware.getCostForOffers,
  userSchedulerController.bookAppointment
);
router.get('/appointments',
  auth.authenticateAsUser,
  userSchedulerController.getMyAppointments
);
router.get('/appointments/history',
  auth.authenticateAsUser,
  userSchedulerController.getPastAppointments
);
router.get('/appointments/invoice/:id',
auth.authenticateAsUser,
userSchedulerController.getInvoice
);
router.get('/appointments/:id',
  auth.authenticateAsUser,
  userSchedulerController.fetchSingle
);
router.put('/appointments/:id',
  auth.authenticateAsUser,
  (req, res, next) => {
    req.body.price = 0;
    req.body.offers = req.body.offers ? req.body.offers : [];
    req.body.services = req.body.services ? req.body.services : [];
    next();
  },
  appntmntsMiddleware.isSlotAvailable,
  servicesMiddleware.isServicesExist,
  offersMiddleware.isOffersExist,
  offersMiddleware.excludeServicesByOffer,
  servicesMiddleware.getCostForServices,
  offersMiddleware.getCostForOffers,
  userSchedulerController.updateAppointment
);
module.exports = router;
