const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null,
  },
  adminName: {
    type: String,
    default: '',
  },
  adminRole: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    required: true,
    // e.g. 'SELLER_APPROVED', 'PRODUCT_REJECTED', 'PAYOUT_RELEASED'
  },
  targetType: {
    type: String,
    required: true,
    // e.g. 'Seller', 'Product', 'Order'
  },
  targetId: {
    type: String,
    required: true,
  },
  beforeValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  afterValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
