const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// In-memory alert thresholds (a real app would persist these in DB or config)
let alertThresholds = {
  lowStockThreshold: 10,
  delayedOrderDays: 5,
  pendingKycDays: 7,
  payoutFailureAlert: true,
};

// ── GET /api/notifications ────────────────────────────────────────────────────
// Query: ?isRead=false&type=kyc_pending&page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ isRead: false }),
    ]);

    res.json({
      success: true,
      total,
      unreadCount,
      page: parseInt(page),
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/notifications/broadcast ────────────────────────────────────────
// Body: { type, title, message, targetRole, relatedId }
router.post(
  '/broadcast',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  async (req, res) => {
    try {
      const { type, title, message, targetRole, relatedId } = req.body;
      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'type, title, and message are required.',
        });
      }

      const notification = await Notification.create({
        type,
        title,
        message,
        targetRole: targetRole || 'all',
        relatedId: relatedId || '',
        isRead: false,
      });

      res.status(201).json({
        success: true,
        message: 'Notification broadcast created.',
        notification,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── GET /api/notifications/settings ──────────────────────────────────────────
router.get('/settings', auth, (req, res) => {
  res.json({ success: true, thresholds: alertThresholds });
});

// ── PUT /api/notifications/settings ──────────────────────────────────────────
router.put(
  '/settings',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  (req, res) => {
    const { lowStockThreshold, delayedOrderDays, pendingKycDays, payoutFailureAlert } =
      req.body;

    if (lowStockThreshold !== undefined) alertThresholds.lowStockThreshold = lowStockThreshold;
    if (delayedOrderDays !== undefined) alertThresholds.delayedOrderDays = delayedOrderDays;
    if (pendingKycDays !== undefined) alertThresholds.pendingKycDays = pendingKycDays;
    if (payoutFailureAlert !== undefined)
      alertThresholds.payoutFailureAlert = payoutFailureAlert;

    res.json({ success: true, message: 'Alert thresholds updated.', thresholds: alertThresholds });
  }
);

module.exports = router;
