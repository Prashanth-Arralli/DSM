const express = require('express');
const router = express.Router();
const modelsController = require(CONTROLLERS + 'marketingManagers/models');
const validation = require(VALIDATIONS + 'index');

router.get('/', modelsController.query);
router.get('/makes/:id', modelsController.queryModels);

module.exports = router;