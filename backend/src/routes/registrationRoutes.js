const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

// Public registration endpoints
router.post('/register', registrationController.register);
router.post('/verify-email', registrationController.verifyEmail);
router.post('/resend-otp', registrationController.resendOTP);

// Protected reviewer endpoints (HR / Admin)
router.get(
  '/',
  authenticateSession,
  authorizePermission('registrations', 'manage'),
  checkCompanyAccess,
  registrationController.listRequests
);

router.put(
  '/:id/approve',
  authenticateSession,
  authorizePermission('registrations', 'manage'),
  checkCompanyAccess,
  validatePositiveIntParam('id'),
  registrationController.approveRequest
);

router.put(
  '/:id/refuse',
  authenticateSession,
  authorizePermission('registrations', 'manage'),
  checkCompanyAccess,
  validatePositiveIntParam('id'),
  registrationController.refuseRequest
);

module.exports = router;
