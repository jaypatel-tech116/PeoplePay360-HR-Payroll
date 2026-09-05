const express = require('express');
const router = express.Router();
const payrunController = require('../controllers/payrunController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

// Two-step wizard endpoints
router.post(
  '/preview-eligible-employees',
  authorizePermission('payruns', 'create'),
  payrunController.previewEligibleEmployees
);

router.post(
  '/',
  authorizePermission('payruns', 'create'),
  payrunController.createPayrun
);

router.get(
  '/',
  authorizePermission('payruns', 'read'),
  payrunController.getPayruns
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'read'),
  payrunController.getPayrunById
);

router.post(
  '/:id/compute',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'compute'),
  payrunController.computePayrun
);

router.post(
  '/:id/validate',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'validate'),
  payrunController.validatePayrun
);

router.post(
  '/:id/mark-paid',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'mark_paid'),
  payrunController.markPaidPayrun
);

router.post(
  '/:id/send-payslips',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'send_payslips'),
  payrunController.sendPayslips
);

router.delete(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('payruns', 'delete'),
  payrunController.deletePayrun
);

module.exports = router;
