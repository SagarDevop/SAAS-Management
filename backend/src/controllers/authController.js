const User = require('../models/User');
const Business = require('../models/Business');
const Otp = require('../models/Otp');
const { generateToken } = require('../utils/jwt');
const { sendEmailOTP } = require('../services/emailService');

// Helper to generate secure 6-digit OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Step 1: Request Signup OTP via Brevo Email
// @route   POST /api/auth/send-signup-otp
exports.sendSignupOtp = async (req, res) => {
  try {
    const { email, name, businessName, password, phone } = req.body;

    if (!email || !password || !name || !businessName) {
      return res.status(400).json({
        success: false,
        message: 'Name, Business Name, Gmail address, and Password are required'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update pending OTP request
    await Otp.deleteMany({ email: cleanEmail });
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      name: name.trim(),
      businessName: businessName.trim(),
      password,
      phone: phone ? phone.trim() : '',
      purpose: 'signup',
      expiresAt
    });

    // Send OTP via Brevo
    const emailResult = await sendEmailOTP({
      toEmail: cleanEmail,
      toName: name.trim(),
      otp: otpCode,
      businessName: businessName.trim()
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email via Brevo. Please check the email address.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code.`
    });
  } catch (err) {
    console.error('sendSignupOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error sending verification code' });
  }
};

// @desc    Step 2: Verify Signup OTP & Create Multi-tenant Workspace
// @route   POST /api/auth/verify-signup-otp
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpDoc = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      purpose: 'signup',
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new code.'
      });
    }

    // 1. Create dedicated Business Workspace for this new SaaS tenant
    const business = await Business.create({
      name: otpDoc.businessName,
      ownerName: otpDoc.name,
      ownerEmail: cleanEmail,
      phone: otpDoc.phone || ''
    });

    // 2. Create User account linked to this business
    const user = await User.create({
      businessId: business._id,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      name: otpDoc.name,
      password: otpDoc.password,
      phone: otpDoc.phone || '',
      role: 'owner',
      isVerified: true
    });

    // Clean up OTP record
    await Otp.deleteMany({ email: cleanEmail });

    // Generate JWT token
    const token = generateToken({ id: user._id, role: user.role, businessId: business._id });

    // Set cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Account created and verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: business._id
      },
      business: {
        id: business._id,
        name: business.name
      }
    });
  } catch (err) {
    console.error('verifySignupOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error completing registration' });
  }
};

// @desc    Standard Login with Email/Username & Password
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Support login by email or username (for backward compatibility with admin)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const business = await Business.findById(user.businessId);

    const token = generateToken({ id: user._id, role: user.role, businessId: user.businessId });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        businessId: user.businessId
      },
      business: business ? {
        id: business._id,
        name: business.name
      } : null
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

// @desc    Get Current User Profile & Business Workspace
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const business = await Business.findById(req.businessId);

    res.status(200).json({
      success: true,
      user,
      business
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Step 1: Request Password Reset OTP via Brevo Email
// @route   POST /api/auth/forgot-password-otp
exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Gmail address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanEmail }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered KaamSetu account found with this email'
      });
    }

    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ email: user.email, purpose: 'forgot_password' });
    await Otp.create({
      email: user.email,
      otp: otpCode,
      name: user.name,
      purpose: 'forgot_password',
      expiresAt
    });

    const emailResult = await sendEmailOTP({
      toEmail: user.email,
      toName: user.name,
      otp: otpCode,
      purpose: 'forgot_password'
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset code via email'
      });
    }

    res.status(200).json({
      success: true,
      message: `Password reset code sent to ${user.email}. Check your inbox.`
    });
  } catch (err) {
    console.error('sendForgotPasswordOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error sending password reset OTP' });
  }
};

// @desc    Step 2: Verify Reset OTP & Update Password
// @route   POST /api/auth/reset-password
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpDoc = await Otp.findOne({
      email: cleanEmail,
      otp: cleanOtp,
      purpose: 'forgot_password',
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new one.'
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set new password (pre-save hook hashes it)
    user.password = newPassword;
    await user.save();

    // Remove used OTP
    await Otp.deleteMany({ email: cleanEmail, purpose: 'forgot_password' });

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('resetPasswordWithOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
