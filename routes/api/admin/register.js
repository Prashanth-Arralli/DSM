const express = require('express');
const router = express.Router();
const adminRegisterController = require(CONTROLLERS + 'admin/register');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth');
const plansMiddleware = require(MIDDLEWARES + 'plans')
/* admin register routes. */
router.post(
    '/',
    // validation.validate('register'),
    plansMiddleware.getPlan,
    adminRegisterController.register
);
/* admin verify routes. */
router.get(
    '/verify',
    adminRegisterController.verify
);
module.exports = router;
