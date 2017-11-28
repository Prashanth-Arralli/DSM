const express = require('express');
const router = express.Router();
const usedCarManagerIndexController = require(CONTROLLERS + 'usedCarManagers/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
/* usedCarManager login routes. */
router.post('/login', validation.validate('login'), usedCarManagerIndexController.login);
/* usedCarManager register routes. */
router.post('/register', validation.validate('usedCarMangerRegister'), usedCarManagerIndexController.register);
/*usedCarManager forgot password */
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  usedCarManagerIndexController.forgotPassword
);
/*usedCarManager reset password */
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  usedCarManagerIndexController.resetPassword
);

router.post(
  '/sendmessage',
  usedCarManagerIndexController.sendMessage
);

router.use('/profile', auth.authenticateAsUsdCarMnger, require('./profile'));
router.use('/settings',  require('./settings'));
router.use('/appointments',  require('./appointments'));
router.use('/vehicles',  require('./vehicles'));

module.exports = router;
