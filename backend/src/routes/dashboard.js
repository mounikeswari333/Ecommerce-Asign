const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// ── GET /api/dashboard ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // ── Parallel queries ──────────────────────────────────────────────────────
    const [
      todayRevenueResult,
      activeOrdersCount,
      pendingOrdersCount,
      lowStockAlertsCount,
      pendingSellerApprovalsCount,
      pendingPayoutsResult,
      totalSellersCount,
      grossSalesMonthResult,
      netRevenueMonthResult,
      recentOrders,
      topSellers,
    ] = await Promise.all([
      // Today revenue (delivered orders)
      Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: todayStart, $lt: todayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$grossAmount' } } },
      ]),

      // Active orders
      Order.countDocuments({
        status: { $in: ['placed', 'packed', 'in_transit', 'out_for_delivery'] },
      }),

      // Pending orders
      Order.countDocuments({ status: 'placed' }),

      // Low stock alerts
      Product.countDocuments({ stock: { $lt: 10 }, status: 'live' }),

      // Pending seller approvals
      Seller.countDocuments({ status: 'pending' }),

      // Pending payouts
      Payment.aggregate([
        { $match: { payoutStatus: 'pending' } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: '$netPayoutAmount' },
          },
        },
      ]),

      // Total active sellers
      Seller.countDocuments({ status: 'active' }),

      // Gross sales this month
      Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'placed', 'packed', 'in_transit', 'out_for_delivery'] },
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$grossAmount' } } },
      ]),

      // Net revenue (platform commission) this month
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$platformCommission' } } },
      ]),

      // Recent 10 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('sellerId', 'businessName sellerId'),

      // Top 5 sellers by gross sales
      Payment.aggregate([
        {
          $group: {
            _id: '$sellerId',
            totalGross: { $sum: '$grossSaleAmount' },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalGross: -1 } },
        { $limit: 5 },
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
            totalGross: 1,
            totalOrders: 1,
            'seller.businessName': 1,
            'seller.sellerId': 1,
          },
        },
      ]),
    ]);

    // ── Revenue chart: last 30 days ───────────────────────────────────────────
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const revenueChartRaw = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          amount: { $sum: '$grossAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in zeros for missing days
    const revenueChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = revenueChartRaw.find((r) => r._id === dateStr);
      revenueChart.push({ date: dateStr, amount: found ? found.amount : 0 });
    }

    // Aggregate platform-wide metrics from payments
    const paymentsSummary = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grossSaleAmount' },
          totalCommission: { $sum: '$platformCommission' },
          totalGatewayFee: { $sum: '$paymentGatewayFee' },
          totalSellerPayout: { $sum: '$netPayoutAmount' }
        }
      }
    ]);
    const summary = paymentsSummary[0] || {
      totalRevenue: 0,
      totalCommission: 0,
      totalGatewayFee: 0,
      totalSellerPayout: 0
    };

    res.json({
      success: true,
      data: {
        todayRevenue: todayRevenueResult[0]?.total || 0,
        activeOrders: activeOrdersCount,
        pendingOrders: pendingOrdersCount,
        lowStockAlerts: lowStockAlertsCount,
        pendingSellerApprovals: pendingSellerApprovalsCount,
        pendingPayouts: {
          count: pendingPayoutsResult[0]?.count || 0,
          amount: pendingPayoutsResult[0]?.amount || 0,
        },
        totalSellers: totalSellersCount,
        grossSalesMonth: grossSalesMonthResult[0]?.total || 0,
        netRevenueMonth: netRevenueMonthResult[0]?.total || 0,
        recentOrders,
        topSellers,
        revenueChart,
        totalRevenue: summary.totalRevenue,
        totalCommission: summary.totalCommission,
        totalGatewayFee: summary.totalGatewayFee,
        totalSellerPayout: summary.totalSellerPayout
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
