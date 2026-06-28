const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'seller_signup',
      'low_stock',
      'payout_failed',
      'order_delayed',
      'kyc_pending',
      'complaint',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    default: 'all',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
