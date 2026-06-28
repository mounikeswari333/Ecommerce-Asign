const express = require('express');
const Payment = require('../models/Payment');
const PayoutBatch = require('../models/PayoutBatch');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLogger');
const Product = require('../models/Product');
const PayoutLog = require('../models/PayoutLog');

const router = express.Router();
const financeAccess = [allowRoles('super_admin', 'finance_admin')];

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay SDK
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173kKeyIdMock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secretKeyMock',
});

// Helper to generate simulated shipment details
function generateMockShipmentDetails(orderId) {
  const trk = 'TRK-' + Math.floor(1000000000 + Math.random() * 9000000000);
  const awb = 'AWB-' + Math.floor(10000000 + Math.random() * 90000000);
  const label = `https://shiprocket-labels.s3.amazonaws.com/label_${orderId}.pdf`;
  return { trackingNumber: trk, awbNumber: awb, shippingLabelUrl: label };
}

// ── POST /api/payments/checkout (Public/Buyer Checkout) ──────────────────────
router.post('/checkout', async (req, res) => {
  try {
    const { 
      items, 
      buyerName, 
      buyerPhone, 
      deliveryAddress, 
      paymentMode, 
      courierPartner, 
      shippingCost = 0, 
      estimatedDelivery = '',
      idempotencyKey 
    } = req.body;

    if (!items || !items.length || !buyerName || !buyerPhone || !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Missing required checkout information.' });
    }

    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
      }
      subtotal += product.price * item.qty;
    }

    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const grossAmount = parseFloat((subtotal + shippingCost + tax).toFixed(2));

    const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);

    const options = {
      amount: Math.round(grossAmount * 100),
      currency: 'INR',
      receipt: orderId,
      notes: { orderId }
    };

    try {
      const rzpOrder = await razorpay.orders.create(options);
      res.json({ 
        success: true, 
        razorpayOrderId: rzpOrder.id, 
        orderId: orderId,
        amount: grossAmount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (apiErr) {
      console.error('Razorpay SDK order creation failed:', apiErr);
      res.status(500).json({ success: false, message: apiErr.message || 'Razorpay order creation failed.' });
    }
  } catch (err) {
    console.error('Checkout Endpoint Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/verify (Public/Buyer) ─────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { 
      orderId, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      items,
      buyerName,
      buyerPhone,
      deliveryAddress,
      paymentMode,
      courierPartner,
      shippingCost = 50,
      estimatedDelivery = '',
      buyerId
    } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All signature verification parameters are required' });
    }

    // Official Razorpay Cryptographic Verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'RAZORPAY_KEY_SECRET is not configured on the backend.' });
    }
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated = hmac.digest('hex');

    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Cart items array is required.' });
    }

    // Check if order already exists (to prevent duplicate creation)
    let order = await Order.findOne({ orderId });
    let paymentRecord;
    
    if (!order) {
      // Calculate totals
      let subtotal = 0;
      const computedItems = [];
      let firstProduct = null;

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
        }
        if (!firstProduct) firstProduct = product;
        
        subtotal += product.price * item.qty;
        computedItems.push({
          productId: product._id,
          name: product.name,
          qty: item.qty,
          price: product.price
        });
      }

      const tax = parseFloat((subtotal * 0.05).toFixed(2));
      const grossAmount = parseFloat((subtotal + shippingCost + tax).toFixed(2));

      const platformCommission = parseFloat((grossAmount * 0.05).toFixed(2));
      const paymentGatewayFee = parseFloat((grossAmount * 0.025).toFixed(2));
      const netSellerAmount = parseFloat((grossAmount - platformCommission - paymentGatewayFee).toFixed(2));

      // Generate Shipment details
      const shipment = generateMockShipmentDetails(orderId);
      
      const timeline = [
        { status: 'placed', timestamp: new Date(), note: 'Order placed.' },
        { status: 'placed', timestamp: new Date(), note: 'Payment successfully captured via Razorpay.' },
        { status: 'packed', timestamp: new Date(), note: `Shipment generated. Courier: ${courierPartner || 'Easy Ship Partner'}, AWB: ${shipment.awbNumber}` }
      ];

      order = await Order.create({
        orderId,
        sellerId: firstProduct.sellerId,
        buyerId: buyerId || 'PSPK-B-00001',
        buyerName,
        buyerPhone,
        buyerAddress: deliveryAddress,
        deliveryAddress,
        items: computedItems,
        grossAmount,
        status: 'packed',
        paymentMode: 'prepaid',
        paymentStatus: 'paid',
        shippingMode: 'easy_ship',
        courierPartner: courierPartner || 'DTDC',
        shippingCost,
        estimatedDelivery,
        platformCommission,
        paymentGatewayFee,
        netSellerAmount,
        trackingNumber: shipment.trackingNumber,
        awbNumber: shipment.awbNumber,
        shippingLabelUrl: shipment.shippingLabelUrl,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        timeline
      });

      const platformTaxes = parseFloat((platformCommission * 0.18).toFixed(2));
      const logisticsCost = shippingCost || 0;
      const adjustments = 0;
      const netPayoutAmount = parseFloat(
        (grossAmount - platformCommission - paymentGatewayFee - logisticsCost - platformTaxes + adjustments).toFixed(2)
      );

      paymentRecord = await Payment.create({
        paymentId: 'PAY-' + Math.floor(10000 + Math.random() * 90000),
        orderId: order._id,
        sellerId: order.sellerId,
        grossSaleAmount: grossAmount,
        platformCommission,
        paymentGatewayFee,
        logisticsCost,
        taxes: platformTaxes,
        adjustments,
        netPayoutAmount,
        payoutStatus: 'pending',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
    } else {
      paymentRecord = await Payment.findOne({ orderId: order._id });
    }

    res.json({ 
      success: true, 
      message: 'Payment verified, order created and recorded.', 
      paymentId: paymentRecord?.paymentId || 'PAY-SUCCESS',
      orderStatus: order.status 
    });
  } catch (err) {
    console.error('Razorpay Verification Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/webhook (Public/Razorpay Callback) ────────────────────
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Webhook signature header missing' });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(req.body));
    const digest = hmac.digest('hex');

    if (digest !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log('Razorpay Webhook Received Event:', event);

    if (event === 'payment.captured') {
      const payload = req.body.payload.payment.entity;
      const receiptId = payload.notes.orderId || payload.description;
      
      const order = await Order.findOne({ orderId: receiptId });
      if (order && order.paymentStatus !== 'paid') {
        const shipment = generateMockShipmentDetails(order.orderId);
        order.trackingNumber = shipment.trackingNumber;
        order.awbNumber = shipment.awbNumber;
        order.shippingLabelUrl = shipment.shippingLabelUrl;

        order.paymentStatus = 'paid';
        order.razorpayOrderId = payload.order_id || '';
        order.razorpayPaymentId = payload.id || '';
        order.razorpaySignature = signature || '';

        order.timeline.push({
          status: 'placed',
          timestamp: new Date(),
          note: 'Payment captured asynchronously via Razorpay webhook.',
        });
        order.timeline.push({
          status: 'packed',
          timestamp: new Date(),
          note: `Shipment generated. Courier: ${order.courierPartner || 'Easy Ship Partner'}, AWB: ${order.awbNumber}`,
        });
        order.status = 'packed';
        await order.save();
        
        const exists = await Payment.findOne({ orderId: order._id });
        if (!exists) {
          const grossSaleAmount = order.grossAmount;
          const platformCommission = order.platformCommission || parseFloat((grossSaleAmount * 0.05).toFixed(2));
          const paymentGatewayFee = order.paymentGatewayFee || parseFloat((grossSaleAmount * 0.025).toFixed(2));
          const logisticsCost = order.shippingCost || 0;
          const taxes = parseFloat((platformCommission * 0.18).toFixed(2));
          
          await Payment.create({
            paymentId: 'PAY-' + Math.floor(10000 + Math.random() * 90000),
            orderId: order._id,
            sellerId: order.sellerId,
            grossSaleAmount,
            platformCommission,
            paymentGatewayFee,
            logisticsCost,
            taxes,
            netPayoutAmount: parseFloat((grossSaleAmount - platformCommission - paymentGatewayFee - logisticsCost - taxes).toFixed(2)),
            payoutStatus: 'pending',
            razorpayOrderId: payload.order_id || '',
            razorpayPaymentId: payload.id || '',
            razorpaySignature: signature || '',
          });
        }
      }
    } else if (event === 'payment.failed') {
      const payload = req.body.payload.payment.entity;
      const receiptId = payload.notes.orderId || payload.description;
      
      const order = await Order.findOne({ orderId: receiptId });
      if (order) {
        order.paymentStatus = 'failed';
        order.timeline.push({
          status: 'cancelled',
          timestamp: new Date(),
          note: 'Payment failed asynchronously via Razorpay webhook.',
        });
        order.status = 'cancelled';
        await order.save();
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay Webhook Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments ─────────────────────────────────────────────────────────
// Query: ?seller=id&status=pending&dateFrom&dateTo&page&limit
router.get('/', auth, async (req, res) => {
  try {
    const { seller, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Enforce role-based access control
    if (req.admin.role === 'seller') {
      filter.sellerId = req.admin.id;
    } else {
      const allowedRoles = ['super_admin', 'finance_admin'];
      if (!allowedRoles.includes(req.admin.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (seller) filter.sellerId = seller;
    }

    if (status) filter.payoutStatus = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('sellerId', 'businessName sellerId')
        .populate('orderId', 'orderId grossAmount status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/payout-batches ─────────────────────────────────────────
router.get('/payout-batches', auth, ...financeAccess, async (req, res) => {
  try {
    const batches = await PayoutBatch.find()
      .populate('sellerId', 'businessName sellerId')
      .populate('releasedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: batches.length, batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/ledger ─────────────────────────────────────────────────
router.get('/ledger', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.admin.role === 'seller') {
      filter.sellerId = req.admin.id;
    } else {
      const allowedRoles = ['super_admin', 'finance_admin'];
      if (!allowedRoles.includes(req.admin.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      if (req.query.seller) filter.sellerId = req.query.seller;
    }

    const ledger = await mongoose.model('SellerLedger').find(filter)
      .populate('sellerId', 'businessName sellerId')
      .populate('orderId', 'orderId grossAmount status')
      .sort({ createdAt: -1 });

    res.json({ success: true, ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/payout-batches ────────────────────────────────────────
// Body: { sellerId, periodStart, periodEnd }
router.post('/payout-batches', auth, ...financeAccess, async (req, res) => {
  try {
    const { sellerId, periodStart, periodEnd } = req.body;
    if (!sellerId || !periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        message: 'sellerId, periodStart, periodEnd are required.',
      });
    }

    // Find pending payments for this seller in the period
    const payments = await Payment.find({
      sellerId,
      payoutStatus: 'pending',
      createdAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    });

    if (payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payments found for this seller in the given period.',
      });
    }

    const totalGross = payments.reduce((s, p) => s + p.grossSaleAmount, 0);
    const totalNetPayout = payments.reduce((s, p) => s + p.netPayoutAmount, 0);

    const batch = await PayoutBatch.create({
      sellerId,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      totalOrders: payments.length,
      totalGross,
      totalNetPayout,
      status: 'scheduled',
    });

    // Link payments to this batch
    await Payment.updateMany(
      { _id: { $in: payments.map((p) => p._id) } },
      { payoutBatchId: batch._id, payoutStatus: 'processing' }
    );

    // Create PayoutLog entry
    await PayoutLog.create({
      payoutBatchId: batch._id,
      sellerId,
      amount: totalNetPayout,
      status: 'scheduled',
      note: 'Payout batch scheduled.',
    });

    res.status(201).json({ success: true, batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/payments/payout-batches/:id/release ──────────────────────────────
router.put(
  '/payout-batches/:id/release',
  auth,
  ...financeAccess,
  auditLog('PAYOUT_RELEASED', 'PayoutBatch'),
  async (req, res) => {
    try {
      const batch = await PayoutBatch.findById(req.params.id);
      if (!batch)
        return res.status(404).json({ success: false, message: 'Batch not found.' });

      req._auditBefore = { status: batch.status };
      batch.status = 'processing';
      batch.releasedBy = req.admin.id;
      batch.releasedAt = new Date();
      await batch.save();
      req._auditAfter = { status: 'processing' };

      // Create PayoutLog entry
      await PayoutLog.create({
        payoutBatchId: batch._id,
        sellerId: batch.sellerId,
        amount: batch.totalNetPayout,
        status: 'processing',
        actionBy: req.admin.id,
        note: 'Payout batch released for processing.',
      });

      res.json({ success: true, message: 'Payout batch released for processing.', batch });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/payments/payout-batches/:id/complete ────────────────────────────
router.put(
  '/payout-batches/:id/complete',
  auth,
  ...financeAccess,
  auditLog('PAYOUT_COMPLETED', 'PayoutBatch'),
  async (req, res) => {
    try {
      const { bankUTR } = req.body;
      const batch = await PayoutBatch.findById(req.params.id);
      if (!batch)
        return res.status(404).json({ success: false, message: 'Batch not found.' });

      req._auditBefore = { status: batch.status };
      batch.status = 'completed';
      batch.bankUTR = bankUTR || '';
      await batch.save();

      // Mark related payments as settled
      await Payment.updateMany(
        { payoutBatchId: batch._id },
        { payoutStatus: 'settled', settledAt: new Date() }
      );

      req._auditAfter = { status: 'completed', bankUTR };

      // Create PayoutLog entry
      await PayoutLog.create({
        payoutBatchId: batch._id,
        sellerId: batch.sellerId,
        amount: batch.totalNetPayout,
        status: 'completed',
        bankUTR: bankUTR || '',
        note: `Payout completed. UTR: ${bankUTR}`,
      });

      res.json({ success: true, message: 'Payout batch completed.', batch });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/payments/:id/hold ────────────────────────────────────────────────
router.put(
  '/:id/hold',
  auth,
  ...financeAccess,
  auditLog('PAYMENT_ON_HOLD', 'Payment'),
  async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment)
        return res.status(404).json({ success: false, message: 'Payment not found.' });

      req._auditBefore = { payoutStatus: payment.payoutStatus };
      payment.payoutStatus = 'on_hold';
      await payment.save();
      req._auditAfter = { payoutStatus: 'on_hold' };

      res.json({ success: true, message: 'Payment put on hold.', payment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── GET /api/payments/failed ──────────────────────────────────────────────────
router.get('/failed', auth, ...financeAccess, async (req, res) => {
  try {
    const payments = await Payment.find({ payoutStatus: 'failed' })
      .populate('sellerId', 'businessName sellerId')
      .populate('orderId', 'orderId grossAmount')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/reports/tax ─────────────────────────────────────────────
router.get('/reports/tax', auth, ...financeAccess, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const filter = {};
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const result = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossSaleAmount' },
          totalCommission: { $sum: '$platformCommission' },
          totalGWFee: { $sum: '$paymentGatewayFee' },
          totalTaxes: { $sum: '$taxes' },
          totalNetPayout: { $sum: '$netPayoutAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = result[0] || {
      totalGross: 0,
      totalCommission: 0,
      totalGWFee: 0,
      totalTaxes: 0,
      totalNetPayout: 0,
      count: 0,
    };

    // GST on commission @18%
    summary.gstOnCommission = parseFloat((summary.totalCommission * 0.18).toFixed(2));

    res.json({ success: true, taxReport: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/receipt/:orderId (Invoice Receipt HTML) ──────────────────
router.get('/receipt/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ orderId }).populate('sellerId');
    if (!order) {
      return res.status(404).send('<h1>Order Not Found</h1>');
    }

    const receiptNum = 'REC-' + order.orderId.split('-')[1] + '-' + Math.floor(100 + Math.random() * 900);
    const dateStr = new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${order.orderId}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; background: #fff; }
          .receipt-box { max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 12px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E8B800; padding-bottom: 20px; margin-bottom: 20px; }
          .header h2 { margin: 0; color: #1A1A0E; }
          .header-meta { text-align: right; font-size: 13px; color: #666; }
          .section { margin-bottom: 20px; }
          .section h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #E8B800; border-bottom: 1px solid #f5f5f5; padding-bottom: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
          .grid div span { color: #666; display: block; font-size: 11px; }
          .grid div strong { color: #333; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          .table th { background: #fdfae6; text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
          .table td { padding: 10px; border-bottom: 1px solid #eee; }
          .totals { margin-top: 20px; text-align: right; border-top: 2px double #eee; padding-top: 10px; }
          .totals-row { display: flex; justify-content: flex-end; gap: 40px; font-size: 13px; margin-bottom: 4px; }
          .totals-row.final { font-size: 16px; font-weight: bold; color: #E8B800; margin-top: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
          .btn-print { background: #E8B800; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; display: block; margin: 20px auto 0; }
          @media print { .btn-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <h2>PashuSevak Marketplace</h2>
              <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Payment Transaction Receipt</p>
            </div>
            <div class="header-meta">
              <div><strong>Receipt:</strong> ${receiptNum}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
            </div>
          </div>

          <div class="section">
            <h3>Invoice Reference</h3>
            <div class="grid">
              <div><span>Order ID</span><strong>${order.orderId}</strong></div>
              <div><span>Razorpay Payment ID</span><strong>${order.razorpayPaymentId || 'N/A'}</strong></div>
            </div>
          </div>

          <div class="section">
            <div class="grid">
              <div>
                <h3>Customer Details</h3>
                <strong>${order.buyerName}</strong>
                <div style="font-size: 12px; color: #555; margin-top: 4px;">
                  Phone: ${order.buyerPhone}<br>
                  Address: ${order.deliveryAddress?.line1 || ''}, ${order.deliveryAddress?.city || ''}
                </div>
              </div>
              <div>
                <h3>Seller Details</h3>
                <strong>${order.sellerId?.businessName || 'PashuSevak Direct'}</strong>
                <div style="font-size: 12px; color: #555; margin-top: 4px;">
                  Email: ${order.sellerId?.email || '—'}<br>
                  State: ${order.sellerId?.state || '—'}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Product Details</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <div class="totals-row"><span>Shipping Charges:</span><strong>₹${(order.shippingCost || 0).toFixed(2)}</strong></div>
            <div class="totals-row"><span>Taxes (5% GST):</span><strong>₹${((order.grossAmount - order.shippingCost) * 0.05 / 1.05).toFixed(2)}</strong></div>
            <div class="totals-row final"><span>Total Paid:</span><strong>₹${order.grossAmount.toFixed(2)}</strong></div>
          </div>

          <div class="footer">
            <p>Thank you for purchasing on PashuSevak Dairy E-Commerce Portal.</p>
            <p>This is a computer-generated transaction receipt and does not require a physical signature.</p>
            <button class="btn-print" onclick="window.print()">Print Receipt</button>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    res.status(500).send('<h1>Internal Server Error</h1><p>' + err.message + '</p>');
  }
});

module.exports = router;
