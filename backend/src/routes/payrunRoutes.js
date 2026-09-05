const express = require('express');
const router = express.Router();
const payrunController = require('../controllers/payrunController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

// Only Payroll roles can access payrun routes
router.use(requireRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'));

// Two-step wizard endpoints
router.post('/preview-eligible-employees', payrunController.previewEligibleEmployees);
router.post('/', payrunController.createPayrun);

router.get('/', payrunController.getPayruns);
router.get('/:id', payrunController.getPayrunById);

router.post('/:id/compute', payrunController.computePayrun);
router.post('/:id/validate', payrunController.validatePayrun);
router.post('/:id/mark-paid', payrunController.markPaidPayrun);
router.post('/:id/send-payslips', payrunController.sendPayslips);

// Deleting payruns is restricted to HR Payroll Manager and Admin
router.delete('/:id', requireRoles('HR Payroll Manager', 'Admin'), payrunController.deletePayrun);

module.exports = router;
