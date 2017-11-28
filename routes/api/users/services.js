const express = require('express');
const router = express.Router();
const servicesController = require(CONTROLLERS + 'users/services');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
router.get('/', servicesController.getServices);
router.get(
  '/top',
  auth.authenticateAsUser,
  servicesController.topServices
);
router.get(
  '/recommended/:id',
  auth.authenticateAsUser,
  servicesController.recommendedServices
);
router.get('/:id', servicesController.fetchSingle);

module.exports = router;
