const express = require('express');
const router = express.Router();
const adminVehiclesController = require(CONTROLLERS + 'admin/vehicles');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', adminVehiclesController.query);
router.post('/', validation.validate('adminAddUser'), adminVehiclesController.add);
router.delete('/removeall', adminVehiclesController.removeAll);
router.get('/leaseexpiry', adminVehiclesController.getLeaseExpiry);
router.get('/leaseexpiry/search', adminVehiclesController.searchLeaseExpiry);
router.get('/leaseexpiry/remove', adminVehiclesController.removeLeaseExpiry);
router.post('/leaseexpiry/upload',
    fileMiddleware.fileUpload("profilePictures").fields([{
        name: 'file'
    }]),
    fileMiddleware.assignImageDataToBody("fields", ["file"]),
    adminVehiclesController.addLeaseExpiry);
router.get('/:id', adminVehiclesController.fetchSingle);
router.put('/:id', adminVehiclesController.update);
router.delete('/:id', adminVehiclesController.remove);

module.exports = router;