const express = require('express');
const router = express.Router();
const structCtrl = require('../controllers/salaryStructureController');
const ruleCtrl = require('../controllers/salaryRuleController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

// Structures
router.get(
  '/',
  authorizePermission('salary_structures', 'read'),
  structCtrl.getStructures
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('salary_structures', 'read'),
  structCtrl.getStructureById
);

router.post(
  '/',
  authorizePermission('salary_structures', 'create'),
  structCtrl.createStructure
);

router.put(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('salary_structures', 'update'),
  structCtrl.updateStructure
);

router.delete(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('salary_structures', 'delete'),
  structCtrl.deleteStructure
);

// Rules nested under structure
router.get(
  '/:structureId/rules',
  validatePositiveIntParam('structureId'),
  authorizePermission('salary_rules', 'read'),
  ruleCtrl.getRulesByStructure
);

router.post(
  '/:structureId/rules',
  validatePositiveIntParam('structureId'),
  authorizePermission('salary_rules', 'create'),
  ruleCtrl.createRule
);

module.exports = router;
