const mongoose = require('mongoose');

const sellerLedgerSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    grossSaleAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformCommission: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentGatewayFee: {
      type: Number,
      required: true,
      min: 0,
    },
    logisticsCost: {
      type: Number,
      required: true,
      min: 0,
    },
    taxes: {
      type: Number,
      required: true,
      min: 0,
    },
    adjustments: {
      type: Number,
      default: 0,
    },
    netPayoutAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SellerLedger', sellerLedgerSchema);
