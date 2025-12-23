const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateProfile, getProfile, changePassword, facebookLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Các route công khai
router.post('/register', register);
router.post('/login', login);
router.post('/facebook', facebookLogin); // Đăng nhập OAuth Facebook

// Các route được bảo vệ
router.get('/me', protect, getCurrentUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
