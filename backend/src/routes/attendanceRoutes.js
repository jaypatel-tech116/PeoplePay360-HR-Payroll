const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get('/', authorizePermission('attendance', 'read'), attendanceController.getAttendances);
router.get('/today', attendanceController.getTodayStatus);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

// Correction restricted to HR Manager and above
router.post(
  '/:id/correct',
  authorizePermission('attendance', 'correct'),
  validatePositiveIntParam('id'),
  attendanceController.correctAttendance
);

module.exports = router;
