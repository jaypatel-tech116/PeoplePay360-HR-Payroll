const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

// Public listing for signup selection
router.get('/public', companyController.listPublicCompanies);

// Protected endpoints
router.get(
  '/',
  authenticateSession,
  authorizePermission('companies', 'read'),
  companyController.listCompanies
);

router.get(
  '/:id',
  authenticateSession,
  validatePositiveIntParam('id'),
  companyController.getCompanyById
);

router.post(
  '/',
  authenticateSession,
  authorizePermission('companies', 'create'),
  companyController.createCompany
);

router.put(
  '/:id',
  authenticateSession,
  authorizePermission('companies', 'update'),
  validatePositiveIntParam('id'),
  companyController.updateCompany
);

module.exports = router;
