const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.get('/:id/counts', employeeController.getEmployeeSmartCounts);
router.get('/:id/contracts', employeeController.getEmployeeContracts);
router.get('/:id/attendance', employeeController.getEmployeeAttendance);
router.get('/:id/time-off', employeeController.getEmployeeTimeOff);

router.post('/', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), employeeController.createEmployee);
router.put('/:id', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), employeeController.updateEmployee);

module.exports = router;
