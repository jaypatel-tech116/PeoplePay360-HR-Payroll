const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticateJWT, authController.getCurrentUser);
router.post('/avatar', authenticateJWT, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
