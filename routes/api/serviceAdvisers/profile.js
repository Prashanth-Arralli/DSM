const express = require('express');
const router = express.Router();
const adviserProfileController = require(CONTROLLERS + 'serviceAdvisers/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', adviserProfileController.query);

router.put('/',
  fileMiddleware.imgUpload("profilePictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  adviserProfileController.update
);

router.post('/change/password', validation.validate('changePassword'), adviserProfileController.changePassword);

module.exports = router;
