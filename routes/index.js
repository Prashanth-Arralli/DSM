const express = require('express');
const router = express.Router();
const config = require('config');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    version: config.get('version')
  });
});

module.exports = router;
