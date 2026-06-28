const mongoose = require('mongoose');
require('./SellerLedger');
require('./PayoutLog');

function generatePaymentId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PAY-${num}`;
}

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      default: generatePaymentId,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    grossSaleAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // 5% of grossSaleAmount
    platformCommission: {
      type: Number,
      default: 0,
    },
    // 2.5% of grossSaleAmount
    paymentGatewayFee: {
      type: Number,
      default: 0,
    },
    logisticsCost: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    adjustments: {
      type: Number,
      default: 0,
    },
    // gross - commission - gwFee - logistics - taxes + adjustments
    netPayoutAmount: {
      type: Number,
      default: 0,
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'settled', 'on_hold', 'failed'],
      default: 'pending',
    },
    payoutBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayoutBatch',
      default: null,
    },
    settledAt: {
      type: Date,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function () {
  if (this.isModified('grossSaleAmount') || this.isNew) {
    this.platformCommission = parseFloat(
      (this.grossSaleAmount * 0.05).toFixed(2)
    );
    this.paymentGatewayFee = parseFloat(
      (this.grossSaleAmount * 0.025).toFixed(2)
    );
  }
  this.netPayoutAmount = parseFloat(
    (
      this.grossSaleAmount -
      this.platformCommission -
      this.paymentGatewayFee -
      this.logisticsCost -
      this.taxes +
      this.adjustments
    ).toFixed(2)
  );
});

paymentSchema.post('save', async function (doc) {
  try {
    const SellerLedger = mongoose.model('SellerLedger');
    const exists = await SellerLedger.findOne({ paymentId: doc._id });
    if (!exists) {
      await SellerLedger.create({
        sellerId: doc.sellerId,
        paymentId: doc._id,
        orderId: doc.orderId,
        grossSaleAmount: doc.grossSaleAmount,
        platformCommission: doc.platformCommission,
        paymentGatewayFee: doc.paymentGatewayFee,
        logisticsCost: doc.logisticsCost,
        taxes: doc.taxes,
        adjustments: doc.adjustments,
        netPayoutAmount: doc.netPayoutAmount,
        status: doc.payoutStatus === 'settled' ? 'completed' : 'pending',
      });
    } else {
      exists.status = doc.payoutStatus === 'settled' ? 'completed' : 'pending';
      exists.grossSaleAmount = doc.grossSaleAmount;
      exists.platformCommission = doc.platformCommission;
      exists.paymentGatewayFee = doc.paymentGatewayFee;
      exists.logisticsCost = doc.logisticsCost;
      exists.taxes = doc.taxes;
      exists.adjustments = doc.adjustments;
      exists.netPayoutAmount = doc.netPayoutAmount;
      await exists.save();
    }
  } catch (err) {
    console.error('Error syncing Payment to SellerLedger:', err);
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
