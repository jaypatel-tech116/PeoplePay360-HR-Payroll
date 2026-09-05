const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { authorizePermission } = require('../middleware/authorizePermission');
const { checkCompanyAccess } = require('../middleware/checkCompanyAccess');
const { validatePositiveIntParam } = require('../middleware/validateRequest');

router.use(authenticateSession);
router.use(checkCompanyAccess);

router.get(
  '/',
  authorizePermission('contracts', 'read'),
  contractController.getContracts
);

router.get(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('contracts', 'read'),
  contractController.getContractById
);

router.post(
  '/',
  authorizePermission('contracts', 'create'),
  contractController.createContract
);

router.put(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('contracts', 'update'),
  contractController.updateContract
);

router.delete(
  '/:id',
  validatePositiveIntParam('id'),
  authorizePermission('contracts', 'delete'),
  contractController.deleteContract
);

module.exports = router;
