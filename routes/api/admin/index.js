const express = require('express');
const router = express.Router();
const adminIndexController = require(CONTROLLERS + 'admin/index');
const validation = require(VALIDATIONS + 'index');
const auth = require(MIDDLEWARES + 'auth')
/* admin login routes. */
router.post(
    '/login',
    validation.validate('login'),
    adminIndexController.login
);
router.post(
    '/forgot/password',
    validation.validate('forgotPassword'),
    adminIndexController.forgotPassword
);
router.post(
    '/reset/password',
    validation.validate('resetPassword'),
    adminIndexController.resetPassword
);
router.use(
    '/settings',
    auth.authenticateAsAdmin,
    require('./settings')
);
router.use(
    '/services',
    auth.authenticateAsAdmin,
    require('./services')
);
router.use(
    '/users',
    auth.authenticateAsAdmin,
    require('./users')
);
router.use(
    '/profile',
    auth.authenticateAsAdmin,
    require('./profile')
);
router.use(
    '/recall',
    // auth.authenticateAsAdmin,
    require('./recall')
);
router.use(
    '/maintenance',
    auth.authenticateAsAdmin,
    require('./maintenance')
);
router.use(
    '/vehicles',
    auth.authenticateAsAdmin,
    require('./vehicles')
);

router.use(
    '/images',
    auth.authenticateAsAdmin,
    require('./images')
);

router.use(
    '/plans',
    auth.authenticateAsAdmin,
    require('./plans')
);

router.use(
    '/makes',
    require('./makes')
);
router.use(
    '/models',
    require('./models')
);
router.use(
    '/register',
    require('./register')
);

module.exports = router;
