const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

router.get('/', scheduleController.getSchedules);
router.get('/:id', scheduleController.getScheduleById);

router.post('/', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), scheduleController.createSchedule);
router.put('/:id', requireRoles('HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'), scheduleController.updateSchedule);

module.exports = router;
