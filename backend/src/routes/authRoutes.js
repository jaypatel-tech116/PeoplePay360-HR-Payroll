const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateSession } = require('../middleware/authenticateSession');
const { upload } = require('../middleware/upload');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticateSession, authController.logout);
router.get('/me', authenticateSession, authController.getCurrentUser);
router.post('/avatar', authenticateSession, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
