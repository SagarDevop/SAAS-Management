const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  workerId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Worker full name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  dailyWage: {
    type: Number,
    required: [true, 'Daily wage is required'],
    min: [0, 'Daily wage cannot be negative']
  },
  profileImage: {
    type: String,
    default: ''
  },
  aadhaarFront: {
    type: String,
    default: ''
  },
  aadhaarBack: {
    type: String,
    default: ''
  },
  bankDetails: {
    accountNumber: { type: String, default: '', trim: true },
    ifscCode: { type: String, default: '', trim: true },
    bankName: { type: String, default: '', trim: true }
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  workerType: {
    type: String,
    enum: ['Painter', 'Helper', 'Supervisor', 'Contractor', 'Other'],
    default: 'Painter'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  walletBalance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure unique workerId per business
WorkerSchema.index({ businessId: 1, workerId: 1 }, { unique: true });

module.exports = mongoose.model('Worker', WorkerSchema);

