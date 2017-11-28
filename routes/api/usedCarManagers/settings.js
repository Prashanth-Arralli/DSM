const express = require('express');
const router = express.Router();
const uCMSettingsController = require(CONTROLLERS + 'usedCarManagers/settings');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', uCMSettingsController.query);


module.exports = router;
