const express = require('express');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/reports/sales ────────────────────────────────────────────────────
// Query: ?seller=id&category=Milk&dateFrom&dateTo
router.get('/sales', auth, async (req, res) => {
  try {
    const { seller, category, dateFrom, dateTo } = req.query;
    const orderFilter = {};
    if (seller) orderFilter.sellerId = seller;
    if (dateFrom || dateTo) {
      orderFilter.createdAt = {};
      if (dateFrom) orderFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) orderFilter.createdAt.$lte = new Date(dateTo);
    }

    // Aggregate orders
    const salesByStatus = await Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$grossAmount' },
        },
      },
    ]);

    // Sales by seller
    const salesBySeller = await Order.aggregate([
      { $match: { ...orderFilter, status: 'delivered' } },
      {
        $group: {
          _id: '$sellerId',
          revenue: { $sum: '$grossAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          revenue: 1,
          orders: 1,
          'seller.businessName': 1,
          'seller.sellerId': 1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Sales by category (via product items)
    const salesByCategory = await Order.aggregate([
      { $match: { ...orderFilter, status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
          unitsSold: { $sum: '$items.qty' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({
      success: true,
      salesByStatus,
      salesBySeller,
      salesByCategory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/reports/seller-performance ───────────────────────────────────────
router.get('/seller-performance', auth, async (req, res) => {
  try {
    const performance = await Order.aggregate([
      {
        $group: {
          _id: '$sellerId',
          totalOrders: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          fulfillmentRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$delivered', '$totalOrders'] }, 100] },
              0,
            ],
          },
          returnRate: {
            $cond: [
              { $gt: ['$totalOrders', 0] },
              { $multiply: [{ $divide: ['$returned', '$totalOrders'] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalOrders: 1,
          delivered: 1,
          returned: 1,
          cancelled: 1,
          fulfillmentRate: { $round: ['$fulfillmentRate', 2] },
          returnRate: { $round: ['$returnRate', 2] },
          'seller.businessName': 1,
          'seller.sellerId': 1,
        },
      },
      { $sort: { fulfillmentRate: -1 } },
    ]);

    res.json({ success: true, performance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/reports/inventory ────────────────────────────────────────────────
router.get('/inventory', auth, async (req, res) => {
  try {
    const inventory = await Product.aggregate([
      {
        $group: {
          _id: '$sellerId',
          totalProducts: { $sum: 1 },
          liveProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'live'] }, 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] },
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ['$stock', 10] }, { $eq: ['$status', 'live'] }] },
                1,
                0,
              ],
            },
          },
          totalStockValue: { $sum: { $multiply: ['$stock', '$price'] } },
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalProducts: 1,
          liveProducts: 1,
          outOfStock: 1,
          lowStock: 1,
          totalStockValue: 1,
          'seller.businessName': 1,
          'seller.sellerId': 1,
        },
      },
    ]);

    // Overall summary
    const summary = {
      totalProducts: await Product.countDocuments(),
      liveProducts: await Product.countDocuments({ status: 'live' }),
      outOfStock: await Product.countDocuments({ status: 'out_of_stock' }),
      lowStock: await Product.countDocuments({ stock: { $lt: 10 }, status: 'live' }),
      pendingApproval: await Product.countDocuments({ status: 'pending_approval' }),
    };

    res.json({ success: true, summary, byseller: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/reports/settlement ───────────────────────────────────────────────
router.get('/settlement', auth, async (req, res) => {
  try {
    const { dateFrom, dateTo, seller } = req.query;
    const filter = {};
    if (seller) filter.sellerId = seller;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const settlement = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { sellerId: '$sellerId', payoutStatus: '$payoutStatus' },
          count: { $sum: 1 },
          totalGross: { $sum: '$grossSaleAmount' },
          totalCommission: { $sum: '$platformCommission' },
          totalNetPayout: { $sum: '$netPayoutAmount' },
        },
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id.sellerId',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          payoutStatus: '$_id.payoutStatus',
          count: 1,
          totalGross: 1,
          totalCommission: 1,
          totalNetPayout: 1,
          'seller.businessName': 1,
          'seller.sellerId': 1,
        },
      },
      { $sort: { 'seller.businessName': 1, payoutStatus: 1 } },
    ]);

    res.json({ success: true, settlement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
