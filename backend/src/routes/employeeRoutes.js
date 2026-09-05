const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { checkRecordOwnership } = require('../middleware/checkRecordOwnership');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('employees', 'read'),
  employeeController.getEmployees
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  checkRecordOwnership({ paramName: 'id', targetTable: 'employees', readAllPermission: 'employees:read_all' }),
  employeeController.getEmployeeById
);

router.get(
  '/:id/counts',
  validatePositiveIntParam('id'),
  checkRecordOwnership({ paramName: 'id', targetTable: 'employees', readAllPermission: 'employees:read_all' }),
  employeeController.getEmployeeSmartCounts
);

router.get(
  '/:id/contracts',
  validatePositiveIntParam('id'),
  checkRecordOwnership({ paramName: 'id', targetTable: 'employees', readAllPermission: 'contracts:read' }),
  employeeController.getEmployeeContracts
);

router.get(
  '/:id/attendance',
  validatePositiveIntParam('id'),
  checkRecordOwnership({ paramName: 'id', targetTable: 'employees', readAllPermission: 'attendance:read_all' }),
  employeeController.getEmployeeAttendance
);

router.get(
  '/:id/time-off',
  validatePositiveIntParam('id'),
  checkRecordOwnership({ paramName: 'id', targetTable: 'employees', readAllPermission: 'time_off:read_all' }),
  employeeController.getEmployeeTimeOff
);

router.post(
  '/',
  authorizePermission('employees', 'create'),
  employeeController.createEmployee
);

router.put(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('employees', 'update'),
  employeeController.updateEmployee
);

module.exports = router;
