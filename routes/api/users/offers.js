const express = require('express');
const router = express.Router();
const offersController = require(CONTROLLERS + 'users/offers');
router.get('/',
  offersController.query
);

module.exports = router;
