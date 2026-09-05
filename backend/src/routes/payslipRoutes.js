const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', payslipController.getPayslips);
router.get('/:id', payslipController.getPayslipById);
router.get('/:id/pdf', payslipController.getPayslipPDF);

module.exports = router;
