const express = require('express');
const router = express.Router();
const vehiclesController = require(CONTROLLERS + 'marketingManagers/vehicles');

router.get('/years', vehiclesController.getYears);

router.get('/models', vehiclesController.getModels);

module.exports = router;