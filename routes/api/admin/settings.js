const express = require('express');
const router = express.Router();
const adminSettingsController = require(CONTROLLERS + 'admin/settings');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', adminSettingsController.query);
router.put('/', fileMiddleware.imgUpload("profilePictures").fields([{
        name: 'site_logo'
    }]),
    fileMiddleware.assignImageDataToBody("fields", ["site_logo"]), adminSettingsController.update);

module.exports = router;
