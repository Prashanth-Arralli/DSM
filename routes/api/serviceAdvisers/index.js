const express = require('express');
const router = express.Router();
const adviserController = require(CONTROLLERS + 'serviceAdvisers/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
/* admin login routes. */
router.post(
  '/login',
  validation.validate('login'),
  adviserController.login
);
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  adviserController.forgotPassword
);
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  adviserController.resetPassword
);

router.use('/appointments', auth.authenticateAsSrvcAdvsr, require('./appointments'));
router.use('/profile', auth.authenticateAsSrvcAdvsr, require('./profile'));
router.use('/offers', auth.authenticateAsSrvcAdvsr, require('./offers'));
router.use('/user', auth.authenticateAsSrvcAdvsr, require('./users'));
router.use('/services', auth.authenticateAsSrvcAdvsr, require('./services'));
router.use('/vehicles', auth.authenticateAsSrvcAdvsr, require('./vehicles'));
router.use('/recalls', auth.authenticateAsSrvcAdvsr, require('./recalls'));



module.exports = router;
