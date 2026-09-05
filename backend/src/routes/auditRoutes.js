const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');

router.get(
  '/',
  authenticateSession,
  authorizePermission('audit_logs', 'read'),
  auditController.listLogs
);

module.exports = router;
