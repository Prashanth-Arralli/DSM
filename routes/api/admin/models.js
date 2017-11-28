const express = require('express');
const router = express.Router();
const adminModelsController = require(CONTROLLERS + 'admin/models');
const validation = require(VALIDATIONS + 'index');

router.get('/', adminModelsController.query);
router.get('/makes/:id', adminModelsController.queryModels);

module.exports = router;