const express = require('express');
const router = express.Router();
const adminMaintenanceController = require(CONTROLLERS + 'admin/maintenance');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');


router.get('/',
adminMaintenanceController.query);

router.get('/pre',
adminMaintenanceController.queryPre);

router.get('/copy',
adminMaintenanceController.copyPreToApprove);

router.post('/recommend',
adminMaintenanceController.saveRecommendMaintenance);

router.post('/',
adminMaintenanceController.saveMaintenance);

router.delete('/:id',
adminMaintenanceController.deleteMaintenance);

router.get('/search', adminMaintenanceController.searchMaintenance);


module.exports = router;
