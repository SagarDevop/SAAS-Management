const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
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
  date: {
    type: String, // Stored as 'YYYY-MM-DD' for date indexing
    required: true,
    index: true
  },
  fullAttendance: {
    type: Boolean,
    default: false
  },
  halfAttendance: {
    type: Boolean,
    default: false
  },
  attendanceUnits: {
    type: Number,
    required: true,
    default: 0
  },
  wageRate: {
    type: Number,
    required: true,
    default: 0
  },
  earnedAmount: {
    type: Number,
    required: true,
    default: 0
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Compound unique index ensuring no duplicate attendance for the same worker and date
AttendanceSchema.index({ businessId: 1, workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

