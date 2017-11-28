const express = require('express');
const router = express.Router();
const adminRecallController = require(CONTROLLERS + 'admin/recalls');
const validation = require(VALIDATIONS + 'index');
const fileMiddleware = require(MIDDLEWARES + 'file');


router.post('/',
    // fileMiddleware.fileUpload("profilePictures").fields([{
    //     name: 'file'
    // }]),
    // fileMiddleware.assignImageDataToBody("fields", ["file"]),
    adminRecallController.saveRecall);
router.post('/lookup',
    adminRecallController.saveRecallLookUp);
router.get('/',
    adminRecallController.queryRecall);
router.get('/lookup',
    adminRecallController.queryRecallLookUp)
router.get('/search',
    adminRecallController.searchRecall)
router.delete('/:id',
    adminRecallController.deleteRecall);



module.exports = router;