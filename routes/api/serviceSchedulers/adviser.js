const express = require('express');
const router = express.Router();
const sSAdviserController = require(CONTROLLERS + 'serviceSchedulers/adviser');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', sSAdviserController.query);


module.exports = router;
