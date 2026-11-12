const User = require('../models/User');
const Business = require('../models/Business');
const { generateToken } = require('../utils/jwt');

// @desc    Login owner/admin
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    let user = await User.findOne({ username: username.toLowerCase().trim() });
    
    // Auto-seed initial owner if database has zero users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      let defaultBusiness = await Business.findOne();
      if (!defaultBusiness) {
        defaultBusiness = await Business.create({
          name: 'ShreeDev Paint Service',
          ownerName: 'Owner Admin',
          phone: '9876543210'
        });
      }

      user = await User.create({
        businessId: defaultBusiness._id,
        username: 'admin',
        password: 'password123', // Will be hashed by UserSchema pre-save hook
        name: 'ShreeDev Owner',
        role: 'owner'
      });
      console.log('Default owner account seeded: admin / password123');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken({ id: user._id, role: user.role, businessId: user.businessId });

    // Send HTTP-Only Cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      token, // Also return in response body for mobile clients
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        businessId: user.businessId
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
  }
};

// @desc    Get Current User Profile
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

// @desc    Logout User
// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Change Password
// @route   POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
};

