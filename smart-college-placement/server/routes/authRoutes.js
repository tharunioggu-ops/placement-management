const express = require('express');
const { register, login, logout, getProfile, updateProfile, updateProfileImage } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfileImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Profile management (authenticated)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/image', protect, uploadProfileImage.single('profileImage'), updateProfileImage);

module.exports = router;
