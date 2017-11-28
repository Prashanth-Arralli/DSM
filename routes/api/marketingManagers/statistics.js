const express = require('express');
const router = express.Router();
const statisticsController1 = require(CONTROLLERS + 'marketingManagers/statistics');
const statisticsController = require(CONTROLLERS + 'marketingManagers/markatingManagerStats')

router.get('/', statisticsController.getStats);

router.get('/month', statisticsController1.getStats);


module.exports = router;