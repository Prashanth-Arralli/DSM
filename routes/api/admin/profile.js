const express = require('express');
const router = express.Router();
const adminProfileController = require(CONTROLLERS + 'admin/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', adminProfileController.query);
router.put('/', fileMiddleware.imgUpload("profilePictures").fields([{
  name: 'picture'
}]),
fileMiddleware.assignImageDataToBody("fields", ["picture"]), adminProfileController.update);
router.post('/change/password',validation.validate('changePassword'), adminProfileController.changePassword);

module.exports = router;
