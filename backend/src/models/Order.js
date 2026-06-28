const mongoose = require('mongoose');

function generateOrderId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${num}`;
}

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: generateOrderId,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    buyerId: { type: String, default: '' },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    buyerAddress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'placed',
        'packed',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'rto',
      ],
      default: 'placed',
    },
    paymentMode: {
      type: String,
      enum: ['COD', 'prepaid'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    shippingMode: {
      type: String,
      enum: ['easy_ship', 'self_ship'],
      default: 'easy_ship',
    },
    courierPartner: { type: String, default: '' },
    awbNumber: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    shippingLabelUrl: { type: String, default: '' },
    shippingCost: { type: Number, default: 0 },
    estimatedDelivery: { type: String, default: '' },
    idempotencyKey: { type: String, default: null },
    platformCommission: { type: Number, default: 0 },
    paymentGatewayFee: { type: Number, default: 0 },
    netSellerAmount: { type: Number, default: 0 },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    timeline: {
      type: [timelineEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
