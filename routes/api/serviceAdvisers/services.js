const express = require('express');
const router = express.Router();
const servicesController = require(CONTROLLERS + 'serviceAdvisers/services');
const validation = require(VALIDATIONS + 'index');
router.get('/', servicesController.getServices);
router.get('/recommended/:id', servicesController.recommendedServices);
router.get('/:id', servicesController.fetchSingle);

module.exports = router;
