const express = require('express');
const router = express.Router();

const plansController = require(CONTROLLERS + 'admin/plans');

router.get('/',
    plansController.query
);

module.exports = router;