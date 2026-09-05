const express = require('express');
const router = express.Router();
const timeOffController = require('../controllers/timeOffController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

// Types
router.get('/types', authorizePermission('time_off', 'read'), timeOffController.getTypes);
router.post('/types', authorizePermission('time_off', 'manage_types'), timeOffController.createType);

// Allocations
router.get('/allocations', authorizePermission('time_off', 'read'), timeOffController.getAllocations);
router.post('/allocations', authorizePermission('time_off', 'allocate'), timeOffController.createAllocation);

// Requests
router.get('/requests', authorizePermission('time_off', 'read'), timeOffController.getRequests);
router.post('/requests', authorizePermission('time_off', 'apply'), timeOffController.createRequest);
router.post(
  '/requests/:id/approve',
  authorizePermission('time_off', 'approve'),
  validatePositiveIntParam('id'),
  timeOffController.approveRequest
);
router.post(
  '/requests/:id/refuse',
  authorizePermission('time_off', 'refuse'),
  validatePositiveIntParam('id'),
  timeOffController.refuseRequest
);

module.exports = router;
