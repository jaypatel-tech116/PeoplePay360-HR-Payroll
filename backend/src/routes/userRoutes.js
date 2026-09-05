const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

router.get('/', requireRoles('Admin'), userController.getUsers);
router.get('/roles', requireRoles('Admin'), userController.getRoles);
router.put('/:id/role', requireRoles('Admin'), userController.updateUserRole);
router.put('/:id/status', requireRoles('Admin'), userController.toggleUserStatus);

module.exports = router;
