const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

router.get('/', attendanceController.getAttendances);
router.get('/today', attendanceController.getTodayStatus);
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);

// Correction restricted to HR Manager and above
router.post('/:id/correct', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), attendanceController.correctAttendance);

module.exports = router;
