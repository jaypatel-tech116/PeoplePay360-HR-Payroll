const express = require('express');
const router = express.Router();
const ruleCtrl = require('../controllers/salaryRuleController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);
router.use(requireRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'));

router.get('/', ruleCtrl.getAllRules);
router.put('/:id', requireRoles('HR Payroll Manager', 'Admin'), ruleCtrl.updateRule);
router.delete('/:id', requireRoles('HR Payroll Manager', 'Admin'), ruleCtrl.deleteRule);

module.exports = router;
