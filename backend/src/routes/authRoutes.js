const express = require('express');
const router = express.Router();
const { 
  login, 
  getMe, 
  logout, 
  sendSignupOtp, 
  verifySignupOtp,
  sendForgotPasswordOtp,
  resetPasswordWithOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/forgot-password-otp', sendForgotPasswordOtp);
router.post('/reset-password', resetPasswordWithOtp);
router.get('/me', protect, getMe);

module.exports = router;
