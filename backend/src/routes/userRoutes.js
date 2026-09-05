const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);

router.get('/', authorizePermission('users', 'manage'), userController.getUsers);
router.get('/roles', authorizePermission('users', 'manage'), userController.getRoles);
router.put('/:id/role', authorizePermission('users', 'manage'), validatePositiveIntParam('id'), userController.updateUserRole);
router.put('/:id/status', authorizePermission('users', 'manage'), validatePositiveIntParam('id'), userController.toggleUserStatus);

module.exports = router;
