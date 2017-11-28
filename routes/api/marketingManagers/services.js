const express = require('express');
const router = express.Router();
const servicesController = require(CONTROLLERS + 'marketingManagers/services');

router.get('/', servicesController.getServicesList);

router.get('/recommended', servicesController.getRecommendedServices);

module.exports = router;