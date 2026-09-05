const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

router.get('/', contractController.getContracts);
router.get('/:id', contractController.getContractById);

router.post('/', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), contractController.createContract);
router.put('/:id', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), contractController.updateContract);
router.delete('/:id', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), contractController.deleteContract);

module.exports = router;
