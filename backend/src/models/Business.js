const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Enterprise'
  },
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'Labour / Contractor'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);
