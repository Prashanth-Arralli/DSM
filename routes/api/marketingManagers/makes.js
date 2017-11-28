const express = require('express');
const router = express.Router();
const makesController = require(CONTROLLERS + 'marketingManagers/makes');
const validation = require(VALIDATIONS + 'index');

router.get('/', makesController.query);

module.exports = router;

