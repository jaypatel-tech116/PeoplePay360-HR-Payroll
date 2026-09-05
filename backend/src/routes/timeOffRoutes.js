const express = require('express');
const router = express.Router();
const timeOffController = require('../controllers/timeOffController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

// Types
router.get('/types', timeOffController.getTypes);
router.post('/types', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), timeOffController.createType);

// Allocations
router.get('/allocations', timeOffController.getAllocations);
router.post('/allocations', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), timeOffController.createAllocation);

// Requests
router.get('/requests', timeOffController.getRequests);
router.post('/requests', timeOffController.createRequest);
router.post('/requests/:id/approve', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), timeOffController.approveRequest);
router.post('/requests/:id/refuse', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), timeOffController.refuseRequest);

module.exports = router;
