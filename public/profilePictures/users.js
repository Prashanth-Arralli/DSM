const express = require('express');
const router = express.Router();
const adminUsersController = require(CONTROLLERS + 'admin/users');
const validation = require(VALIDATIONS + 'index');
router.get('/', adminUsersController.query);
router.post('/', validation.validate('adminAddUser'), adminUsersController.add);
router.delete('/:id', adminUsersController.remove);
router.get('/:id', adminUsersController.fetchSingle);
router.put('/:id', adminUsersController.update);

module.exports = router;