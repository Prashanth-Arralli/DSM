const express = require('express');
const router = express.Router();
const SSIndexController = require(CONTROLLERS + 'serviceSchedulers/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
/* user login routes. */
router.post('/login', validation.validate('login'), SSIndexController.login);
/* user register routes. */
router.post('/register', validation.validate('userRegister'), SSIndexController.register);
/* user login routes. */
router.post('/social/login', validation.validate('socialLogin'), SSIndexController.socialLogin);
/* user login routes. */
router.post('/social/register', validation.validate('socialLogin'), SSIndexController.socialRegister);
/*user forgot password */
router.post(
  '/forgot/password',
  validation.validate('forgotPassword'),
  SSIndexController.forgotPassword
);
/*user reset password */
router.post(
  '/reset/password',
  validation.validate('resetPassword'),
  SSIndexController.resetPassword
);
router.use(
  '/scheduler',
  auth.authenticateAsSrvceSchdlr,
  require('./scheduler')
);
/*profile  routes */
router.use(
  '/profile',
  auth.authenticateAsSrvceSchdlr,
  require('./profile')
);
/* settingsroutes */
router.use(
  '/settings',
  require('./settings')
);
/* adviser  routes */
router.use(
  '/adviser',
  auth.authenticateAsSrvceSchdlr,
  require('./adviser')
);
/* user   routes */
router.use(
  '/user',
  auth.authenticateAsSrvceSchdlr,
  require('./user')
);
/* user vehicle  routes */
router.use('/vehicles', auth.authenticateAsSrvceSchdlr, require('./vehicles'));
/* user services routes */
router.use('/services', auth.authenticateAsSrvceSchdlr, require('./services'));
/* Appoitment routes */
router.use('/appointments', auth.authenticateAsSrvceSchdlr, require('./appointments'));
/* Offers routes */
router.use('/offers', auth.authenticateAsSrvceSchdlr, require('./offers'));
/* Recall routes */
router.use('/recalls', auth.authenticateAsSrvceSchdlr, require('./recalls'));

module.exports = router;
