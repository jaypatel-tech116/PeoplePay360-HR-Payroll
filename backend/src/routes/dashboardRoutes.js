const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('dashboard', 'read'),
  dashboardController.getDashboard
);

module.exports = router;
