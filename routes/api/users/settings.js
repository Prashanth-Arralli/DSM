const express = require('express');
const router = express.Router();
const settingsController = require(CONTROLLERS + 'users/settings');
const validation = require(VALIDATIONS + 'index');
router.get('/', settingsController.query);

module.exports = router;
