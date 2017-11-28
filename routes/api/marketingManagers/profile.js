const express = require('express');
const router = express.Router();
const profileController = require(CONTROLLERS + 'marketingManagers/profile');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', profileController.query);

router.put('/',
    fileMiddleware.imgUpload("profilePictures").fields([{
        name: 'picture'
    }]),
    fileMiddleware.assignImageDataToBody("fields", ["picture"]),
    profileController.update
);

router.post('/change/password', validation.validate('changePassword'), profileController.changePassword);


module.exports = router;