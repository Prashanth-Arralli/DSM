const express = require('express');
const router = express.Router();
const maintenanceIndexController = require(CONTROLLERS + 'maintenance/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
const maintenanceMiddwre = require(MIDDLEWARES + 'maintenance')

/* maintenance routes. */
router.post('/', 
maintenanceMiddwre.checkMaintanceToken, 
maintenanceIndexController.addPreMaintenance);

router.post('/addunit', 
maintenanceIndexController.addUnit);

router.post('/addintervel', 
maintenanceIndexController.addIntervel);

router.post('/login', 
maintenanceIndexController.login);

router.post('/remove-login', 
maintenanceIndexController.removelogin);

router.get('/', 
maintenanceMiddwre.checkMaintanceToken, 
maintenanceIndexController.queryPreMaintenance);

router.delete('/', 
maintenanceMiddwre.checkMaintanceToken, 
maintenanceIndexController.removePreMaintenance);

module.exports = router;
