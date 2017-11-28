const express = require('express');
const router = express.Router();
const userProfileController = require(CONTROLLERS + 'users/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', userProfileController.query);
router.put('/',
  fileMiddleware.imgUpload("profilePictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  userProfileController.update
);
router.post('/change/password', validation.validate('changePassword'), userProfileController.changePassword);

module.exports = router;
