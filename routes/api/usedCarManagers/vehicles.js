const express = require('express');
const router = express.Router();
const adviserVehicleController = require(CONTROLLERS + 'usedCarManagers/vehicles');

router.put('/:id', adviserVehicleController.makeOffer);

router.get('/:user/:id',adviserVehicleController.fetchSingle);


module.exports = router;