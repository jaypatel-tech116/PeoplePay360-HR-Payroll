const express = require('express');
const router = express.Router();
const structCtrl = require('../controllers/salaryStructureController');
const ruleCtrl = require('../controllers/salaryRuleController');
const { authenticateJWT } = require('../middleware/auth');
const { requireRoles } = require('../middleware/roleAuth');

router.use(authenticateJWT);

// Only Payroll roles have access to the Payroll module
router.use(requireRoles('HR Payroll User', 'HR Payroll Manager', 'Admin'));

// Structures
router.get('/', structCtrl.getStructures);
router.get('/:id', structCtrl.getStructureById);
router.post('/', requireRoles('HR Payroll Manager', 'Admin'), structCtrl.createStructure);
router.put('/:id', requireRoles('HR Payroll Manager', 'Admin'), structCtrl.updateStructure);
router.delete('/:id', requireRoles('HR Payroll Manager', 'Admin'), structCtrl.deleteStructure);

// Rules nested under structure
router.get('/:structureId/rules', ruleCtrl.getRulesByStructure);
router.post('/:structureId/rules', requireRoles('HR Payroll Manager', 'Admin'), ruleCtrl.createRule);

module.exports = router;
