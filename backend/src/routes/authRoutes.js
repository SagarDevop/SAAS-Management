const express = require('express');
const router = express.Router();
const { 
  login, 
  getMe, 
  logout, 
  sendSignupOtp, 
  verifySignupOtp 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.get('/me', protect, getMe);

module.exports = router;
