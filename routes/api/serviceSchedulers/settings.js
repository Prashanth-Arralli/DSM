const express = require('express');
const router = express.Router();
const sSSettingsController = require(CONTROLLERS + 'serviceSchedulers/settings');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', sSSettingsController.query);


module.exports = router;
