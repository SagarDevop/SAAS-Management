const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  password: {
    type: String
  },
  phone: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    enum: ['signup', 'login_otp', 'forgot_password'],
    default: 'signup'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: auto delete after expiration
  }
}, { timestamps: true });

module.exports = mongoose.model('Otp', OtpSchema);
