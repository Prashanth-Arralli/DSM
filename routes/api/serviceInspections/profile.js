const express = require('express');
const router = express.Router();
const serviceInspectionsProfileCntrller = require(CONTROLLERS + 'serviceInspections/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', serviceInspectionsProfileCntrller.query);
router.put('/',
  fileMiddleware.imgUpload("profilePictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  serviceInspectionsProfileCntrller.update
);
router.post('/change/password', validation.validate('changePassword'), serviceInspectionsProfileCntrller.changePassword);

module.exports = router;
