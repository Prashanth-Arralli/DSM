const express = require('express');
const router = express.Router();
const MMIndexController = require(CONTROLLERS + 'users/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
/* user login routes. */
router.post('/login', validation.validate('login'), MMIndexController.login);
/*user forgot password */
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  MMIndexController.forgotPassword
);
/*user reset password */
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  MMIndexController.resetPassword
);
router.use('/offers', auth.authenticateAsMrktngMnger, require('./offers'));
router.use('/statistics', auth.authenticateAsMrktngMnger, require('./statistics'));
router.use('/profile', auth.authenticateAsMrktngMnger, require('./profile'));
router.use('/services', auth.authenticateAsMrktngMnger, require('./services'));
router.use('/vehicles', auth.authenticateAsMrktngMnger, require('./vehicles'));
router.use('/makes', auth.authenticateAsMrktngMnger, require('./makes'));
router.use('/models', auth.authenticateAsMrktngMnger, require('./models'));

module.exports = router;
