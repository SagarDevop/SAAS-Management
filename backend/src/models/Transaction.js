const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'Opening Balance',
      'Attendance Earnings',
      'Advance Given',
      'Bonus Given',
      'Salary/Payment Given',
      'Other Adjustment'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  // direction indicates impact on worker wallet balance:
  // credit: decreases liability to worker / increases advance (+ve)
  // debit: increases liability to worker (worker earned wages / bonus, -ve)
  direction: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  referenceId: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

TransactionSchema.index({ businessId: 1, workerId: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);

