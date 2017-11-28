const express = require('express');
const router = express.Router();
const sSUserController = require(CONTROLLERS + 'serviceSchedulers/user');
const fileMiddleware = require(MIDDLEWARES + 'file');

router.get('/', sSUserController.query);
router.get('/:id', sSUserController.fetchSingle);


module.exports = router;
