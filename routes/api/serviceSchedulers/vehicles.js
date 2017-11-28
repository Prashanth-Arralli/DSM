const express = require('express');
const router = express.Router();
const sSVehiclesController = require(CONTROLLERS + 'serviceSchedulers/vehicles');
const validation = require(VALIDATIONS + 'index');
router.get('/user/:id', sSVehiclesController.query);
router.get('/:id', sSVehiclesController.fetchSingleVehicle);
router.put('/:id', sSVehiclesController.update);

module.exports = router;