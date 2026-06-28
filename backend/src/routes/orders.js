const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// ── POST /api/orders (Public/Buyer Checkout) ─────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { sellerId, items, grossAmount, paymentMode, deliveryAddress, buyerName, buyerPhone, buyerId } = req.body;
    if (!sellerId || !items || !grossAmount || !paymentMode || !deliveryAddress || !buyerName || !buyerPhone) {
      return res.status(400).json({ success: false, message: 'Missing required order placement details' });
    }

    const timeline = [{
      status: 'placed',
      timestamp: new Date(),
      note: 'Order placed successfully.'
    }];

    const order = await Order.create({
      sellerId,
      buyerId: buyerId || 'PSPK-B-00001',
      buyerName,
      buyerPhone,
      buyerAddress: deliveryAddress,
      deliveryAddress,
      items,
      grossAmount,
      status: 'placed',
      paymentMode,
      paymentStatus: 'pending',
      shippingMode: 'easy_ship',
      timeline
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders ───────────────────────────────────────────────────────────
// Query: ?status=placed&seller=id&paymentMode=COD&dateFrom=2024-01-01&dateTo=2024-12-31&page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      seller,
      paymentMode,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (req.admin.role === 'seller') {
      filter.sellerId = req.admin.id;
    } else {
      if (seller) filter.sellerId = seller;
    }
    if (status) filter.status = status;
    if (paymentMode) filter.paymentMode = paymentMode;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('sellerId', 'businessName sellerId')
        .populate('items.productId', 'name productId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/exceptions ────────────────────────────────────────────────
// Delayed orders: in_transit > 5 days, or RTO orders
router.get('/exceptions', auth, async (req, res) => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const [delayed, rto] = await Promise.all([
      Order.find({
        status: 'in_transit',
        updatedAt: { $lte: fiveDaysAgo },
      }).populate('sellerId', 'businessName sellerId'),
      Order.find({ status: 'rto' }).populate('sellerId', 'businessName sellerId'),
    ]);

    res.json({
      success: true,
      delayed: { count: delayed.length, orders: delayed },
      rto: { count: rto.length, orders: rto },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/stats ─────────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = {};
    stats.forEach((s) => {
      result[s._id] = s.count;
    });

    const total = await Order.countDocuments();
    res.json({ success: true, total, byStatus: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('sellerId', 'businessName sellerId email phone')
      .populate('items.productId', 'name productId category');

    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    if (req.admin.role === 'seller' && order.sellerId._id.toString() !== req.admin.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/orders/:id/status ────────────────────────────────────────────────
router.put(
  '/:id/status',
  auth,
  auditLog('ORDER_STATUS_CHANGED', 'Order'),
  async (req, res) => {
    try {
      const { status, note } = req.body;
      const validStatuses = [
        'placed',
        'packed',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'rto',
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }

      const order = await Order.findById(req.params.id);
      if (!order)
        return res.status(404).json({ success: false, message: 'Order not found.' });

      if (req.admin.role === 'seller' && order.sellerId.toString() !== req.admin.id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      req._auditBefore = { status: order.status };
      order.status = status;
      order.timeline.push({
        status,
        timestamp: new Date(),
        note: note || `Status manually updated to ${status} by admin`,
      });
      await order.save();
      req._auditAfter = { status };

      res.json({ success: true, message: 'Order status updated.', order });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── GET /api/orders/:id/tracking ──────────────────────────────────────────────
router.get('/:id/tracking', auth, async (req, res) => {
  try {
    let order = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findById(req.params.id).populate('sellerId', 'businessName sellerId');
    }
    if (!order) {
      order = await Order.findOne({ orderId: req.params.id }).populate('sellerId', 'businessName sellerId');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({
      success: true,
      tracking: {
        orderId: order.orderId,
        status: order.status,
        courierPartner: order.courierPartner,
        awbNumber: order.awbNumber,
        trackingNumber: order.trackingNumber,
        shippingLabelUrl: order.shippingLabelUrl,
        deliveryAddress: order.deliveryAddress,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        paymentMode: order.paymentMode,
        timeline: order.timeline
      }
    });
  } catch (err) {
    console.error('Tracking fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
