const express = require('express');
const router = express.Router();
const serviceInspectionsIndexController = require(CONTROLLERS + 'serviceInspections/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth');

/* vehicleInspections login routes. */
router.post('/login', validation.validate('login'), serviceInspectionsIndexController.login);


/* vehicleInspections forgotPassword routes. */
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  serviceInspectionsIndexController.forgotPassword
);

/* vehicleInspections resetPassword routes. */
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  serviceInspectionsIndexController.resetPassword
);

/* vehicleInspections profile routes. */
router.use('/profile', auth.authenticateAsServiceInspection, require('./profile'));

/* vehicleInspections settings routes. */
router.use('/settings',  require('./settings'));

/* vehicleInspections appointments routes. */
router.use('/appointments', auth.authenticateAsServiceInspection,require('./appointments'));




module.exports = router;
