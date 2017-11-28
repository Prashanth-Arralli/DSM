const express = require('express');
const router = express.Router();
const adminMakesController = require(CONTROLLERS + 'admin/makes');
const validation = require(VALIDATIONS + 'index');

router.get('/', adminMakesController.query);

module.exports = router;

