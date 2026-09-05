const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);
router.use(requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'));

router.get('/', dashboardController.getDashboard);

module.exports = router;
