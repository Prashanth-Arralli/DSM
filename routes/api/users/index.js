const express = require('express');
const router = express.Router();
const userIndexController = require(CONTROLLERS + 'users/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth');
const vehiclesMiddleware = require(MIDDLEWARES + 'vehicles');
const maintenanceMiddleware = require(MIDDLEWARES + 'maintenance');
/* user login routes. */
router.post('/login', validation.validate('login'), userIndexController.login);
/* user register routes. */
router.post(
  '/register',
  validation.validate('userRegister'),
  vehiclesMiddleware.isVinsAvailable,
  vehiclesMiddleware.getVinsInformation,
  maintenanceMiddleware.addRecalls,
  maintenanceMiddleware.addMaintenanceDetails,
  userIndexController.register
);
/* get dealers route. */
router.get(
  '/dealers',
  userIndexController.getDealers
);
/* user login routes. */
router.post('/social/login', validation.validate('socialLogin'), userIndexController.socialLogin);
/* user login routes. */
router.post('/social/register', validation.validate('socialLogin'), userIndexController.socialRegister);
/*user forgot password */
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  userIndexController.forgotPassword
);
/*user reset password */
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  userIndexController.resetPassword
);
/* user vehicle CRUD routes */
router.use('/vehicles', auth.authenticateAsUser, require('./vehicles'));
/* user services routes */
router.use('/services', require('./services'));
/* user profile CRUD routes */
router.use('/profile', auth.authenticateAsUser, require('./profile'));
/* appointment slot routes */
router.use('/scheduler', require('./scheduler'));
/* offers routes */
router.use('/offers', require('./offers'));
/* recalls routes */
router.use('/recalls', auth.authenticateAsUser, require('./recalls'));
/* admin setting get routes */
router.use('/settings', require('./settings'));
module.exports = router;
