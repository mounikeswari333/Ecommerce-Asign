const mongoose = require('mongoose');

function generateBatchId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `BATCH-${num}`;
}

const payoutBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      unique: true,
      default: generateBatchId,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalGross: {
      type: Number,
      default: 0,
    },
    totalNetPayout: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'processing', 'completed', 'failed'],
      default: 'scheduled',
    },
    bankUTR: {
      type: String,
      default: '',
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayoutBatch', payoutBatchSchema);
