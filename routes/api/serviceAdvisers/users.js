const express = require('express');
const router = express.Router();
const userController = require(CONTROLLERS + 'serviceAdvisers/user');

// router.get('/', userController.query);

router.get('/', userController.getUsers);
router.get('/:id', userController.fetchSingle);
router.put('/:id', userController.updateSingle);

module.exports = router;
