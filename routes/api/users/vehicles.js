const express = require('express');
const router = express.Router();
const vehiclesController = require(CONTROLLERS + 'users/vehicles');
const validation = require(VALIDATIONS + 'index');
router.get('/', vehiclesController.query);
const vehiclesMiddleware = require(MIDDLEWARES + 'vehicles');
const maintenanceMiddleware = require(MIDDLEWARES + 'maintenance')
router.post(
  '/',
  validation.validate('userAddVehicles'),
  vehiclesMiddleware.isVinsAvailable,
  vehiclesMiddleware.getVinsInformation,
  maintenanceMiddleware.addRecalls,
  maintenanceMiddleware.addMaintenanceDetails,
  vehiclesController.add
);
router.put(
  '/changeDealership/:id',
  validation.validate('changeDealer'),
  vehiclesController.changeDealer
);
router.delete('/:id', vehiclesController.remove);
router.get('/:id', vehiclesController.fetchSingle);
router.put('/:id', vehiclesController.update);

module.exports = router;
