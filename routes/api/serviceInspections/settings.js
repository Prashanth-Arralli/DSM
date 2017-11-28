const express = require('express');
const router = express.Router();
const serviceInspectionsSettingsCntrller = require(CONTROLLERS + 'serviceInspections/settings');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', serviceInspectionsSettingsCntrller.query);


module.exports = router;
