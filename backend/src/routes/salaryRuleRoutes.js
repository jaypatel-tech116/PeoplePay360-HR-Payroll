const express = require('express');
const router = express.Router();
const ruleCtrl = require('../controllers/salaryRuleController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('salary_rules', 'read'),
  ruleCtrl.getAllRules
);

router.put(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('salary_rules', 'update'),
  ruleCtrl.updateRule
);

router.delete(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('salary_rules', 'delete'),
  ruleCtrl.deleteRule
);

module.exports = router;
