const express = require('express');
const router = express.Router();
const adviserOffesrsController = require(CONTROLLERS + 'serviceAdvisers/offers');
/*  */


router.get('/',
  adviserOffesrsController.query
);

//router.get('/:id', adviserOffesrsController.fetchSingle);

module.exports = router;
