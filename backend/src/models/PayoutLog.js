const mongoose = require('mongoose');

const payoutLogSchema = new mongoose.Schema(
  {
    payoutBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayoutBatch',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'processing', 'completed', 'failed'],
      required: true,
    },
    bankUTR: {
      type: String,
      default: '',
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayoutLog', payoutLogSchema);
