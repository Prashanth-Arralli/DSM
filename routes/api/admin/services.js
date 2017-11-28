const express = require('express');
const router = express.Router();
const adminServicesController = require(CONTROLLERS + 'admin/services');
const validation = require(VALIDATIONS + 'index');

const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', adminServicesController.query);
router.post('/', validation.validate('addServices'), adminServicesController.add);
router.delete('/:id', adminServicesController.remove);
router.get('/:id', adminServicesController.fetchSingle);
router.put('/:id', validation.validate('addServices'), adminServicesController.update);
router.post('/upload',
  fileMiddleware.fileUpload("profilePictures").fields([{
    name: 'file'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["file"]),
  adminServicesController.uploadServices);
router.post('/upload/common',
  fileMiddleware.fileUpload("profilePictures").fields([{
    name: 'file'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["file"]),
  adminServicesController.uploadServicesCommon)

module.exports = router;
