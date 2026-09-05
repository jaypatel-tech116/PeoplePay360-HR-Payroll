const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('payslips', 'read'),
  payslipController.getPayslips
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('payslips', 'read'),
  payslipController.getPayslipById
);

router.get(
  '/:id/pdf',
  validatePositiveIntParam('id'),
  authorizePermission('payslips', 'read'),
  payslipController.getPayslipPDF
);

module.exports = router;
