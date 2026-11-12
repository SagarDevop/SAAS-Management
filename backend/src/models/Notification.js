const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'Worker Registration',
      'Full Attendance Marked',
      'Half Attendance Marked',
      'Advance Added',
      'Bonus Added',
      'Payment Added',
      'Other Wallet Adjustment',
      'General'
    ],
    default: 'General'
  },
  deliveryChannel: {
    type: String,
    enum: ['in_app', 'whatsapp'],
    default: 'in_app'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'sent'
  },
  readStatus: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

NotificationSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

