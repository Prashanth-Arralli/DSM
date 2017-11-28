const express = require('express');
const router = express.Router();
const vehiclesController = require(CONTROLLERS + 'serviceAdvisers/vehicles');

router.put('/:id', vehiclesController.update);

module.exports = router;