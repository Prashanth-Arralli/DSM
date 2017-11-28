const express = require('express');
const router = express.Router();
const sSOffesrsController = require(CONTROLLERS + 'serviceSchedulers/offers');
/*  */


router.get('/',
sSOffesrsController.query
);

//router.get('/:id', adviserOffesrsController.fetchSingle);

module.exports = router;
