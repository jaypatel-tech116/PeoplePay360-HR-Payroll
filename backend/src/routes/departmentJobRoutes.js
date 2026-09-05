const express = require('express');
const router = express.Router();
const controller = require('../controllers/departmentJobController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/departments', controller.getDepartments);
router.get('/job-positions', controller.getJobPositions);

module.exports = router;
