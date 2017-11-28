const express = require('express');
const router = express.Router();
const validation = require(VALIDATIONS + 'index');
const serviceInspectionsAppntmntCntrller = require(CONTROLLERS + 'serviceInspections/appointments');
const fileMiddleware = require(MIDDLEWARES + 'file');
const usersMiddleware = require(MIDDLEWARES + 'users');
const servicesMiddleware = require(MIDDLEWARES + 'service');
const offersMiddleware = require(MIDDLEWARES + 'offer');
const appntmntsMiddleware = require(MIDDLEWARES + 'appointment');

router.get('/', serviceInspectionsAppntmntCntrller.query);

router.get('/search', serviceInspectionsAppntmntCntrller.searchAppointment);

router.get('/:id', serviceInspectionsAppntmntCntrller.fetchSingle);

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

  offersMiddleware.isOffersExist,
  offersMiddleware.excludeServicesByOffer,
  servicesMiddleware.getCostForServices,
  offersMiddleware.getCostForOffers,
  serviceInspectionsAppntmntCntrller.updateAppointment
);


module.exports = router;
