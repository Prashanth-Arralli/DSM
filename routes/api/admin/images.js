const express = require('express');
const router = express.Router();

const adminImageController = require(CONTROLLERS + 'admin/images');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/',
    adminImageController.query
);

router.post('/',
    fileMiddleware.imgUpload("offerMockPictures").fields([{
        name: 'picture'
    }]),
    fileMiddleware.assignImageDataToBody("fields", ["picture"]),
    adminImageController.add
);

router.delete('/:id',
    adminImageController.remove
);


module.exports = router;