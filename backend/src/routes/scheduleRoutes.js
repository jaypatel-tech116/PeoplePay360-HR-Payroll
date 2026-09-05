const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('working_schedules', 'read'),
  scheduleController.getSchedules
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('working_schedules', 'read'),
  scheduleController.getScheduleById
);

router.post(
  '/',
  authorizePermission('working_schedules', 'create'),
  scheduleController.createSchedule
);

router.put(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('working_schedules', 'update'),
  scheduleController.updateSchedule
);

module.exports = router;
