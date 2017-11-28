const express = require('express');
const router = express.Router();
const sSServicesController = require(CONTROLLERS + 'serviceSchedulers/services');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')

router.get('/', sSServicesController.getServices);
router.get('/:id', sSServicesController.fetchSingle);
router.get(
    '/recommended/:id',
    auth.authenticateAsSrvceSchdlr,
    sSServicesController.recommendedServices
  );
module.exports = router;
