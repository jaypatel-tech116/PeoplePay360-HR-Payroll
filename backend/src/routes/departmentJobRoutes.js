const express = require('express');
const router = express.Router();
const controller = require('../controllers/departmentJobController');
const { validateSession } = require('../services/sessionService');
const { COOKIE_NAME } = require('../middleware/authenticateSession');

// Optional session middleware: if logged in, attach user, else continue as guest
const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (token) {
    try {
      const user = await validateSession(token);
      if (user) req.user = user;
    } catch (e) {
      // ignore
    }
  }
  next();
};

router.get('/departments', optionalAuth, controller.getDepartments);
router.get('/job-positions', optionalAuth, controller.getJobPositions);

module.exports = router;
