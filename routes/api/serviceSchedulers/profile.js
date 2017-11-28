const express = require('express');
const router = express.Router();
const sSProfileController = require(CONTROLLERS + 'serviceSchedulers/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', sSProfileController.query);
router.put('/',
  fileMiddleware.imgUpload("profilePictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  sSProfileController.update
);
router.post('/change/password', validation.validate('changePassword'), sSProfileController.changePassword);

module.exports = router;
