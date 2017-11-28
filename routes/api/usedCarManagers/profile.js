const express = require('express');
const router = express.Router();
const usedCarManagersProfileController = require(CONTROLLERS + 'usedCarManagers/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', usedCarManagersProfileController.query);
router.put('/',
  fileMiddleware.imgUpload("profilePictures").fields([{
    name: 'picture'
  }]),
  fileMiddleware.assignImageDataToBody("fields", ["picture"]),
  usedCarManagersProfileController.update
);
router.post('/change/password', validation.validate('changePassword'), usedCarManagersProfileController.changePassword);

module.exports = router;
