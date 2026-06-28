const express = require('express');
const AdminUser = require('../models/AdminUser');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// In-memory platform settings (persist to DB in production via a Settings model)
let platformSettings = {
  platformName: 'PashuSevak',
  platformCommissionRate: 5,
  paymentGatewayFeeRate: 2.5,
  defaultShippingMode: 'easy_ship',
  lowStockThreshold: 10,
  payoutCycleDays: 7,
  supportEmail: 'support@pashusevak.com',
  maintenanceMode: false,
};

// ── GET /api/settings ─────────────────────────────────────────────────────────
router.get('/', auth, (req, res) => {
  res.json({ success: true, settings: platformSettings });
});

// ── PUT /api/settings ─────────────────────────────────────────────────────────
router.put('/', auth, allowRoles('super_admin'), (req, res) => {
  platformSettings = { ...platformSettings, ...req.body };
  res.json({ success: true, message: 'Platform settings updated.', settings: platformSettings });
});

// ── GET /api/settings/admins ──────────────────────────────────────────────────
router.get('/admins', auth, allowRoles('super_admin'), async (req, res) => {
  try {
    const admins = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: admins.length, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/settings/admins ─────────────────────────────────────────────────
router.post(
  '/admins',
  auth,
  allowRoles('super_admin'),
  auditLog('ADMIN_CREATED', 'AdminUser'),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'name, email, password, and role are required.',
        });
      }

      const existing = await AdminUser.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: 'Admin with this email already exists.' });
      }

      const admin = await AdminUser.create({ name, email, password, role });
      req._auditAfter = { adminId: admin._id, name, email, role };

      res.status(201).json({
        success: true,
        message: 'Admin user created.',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isActive: admin.isActive,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/settings/admins/:id ─────────────────────────────────────────────
router.put(
  '/admins/:id',
  auth,
  allowRoles('super_admin'),
  auditLog('ADMIN_UPDATED', 'AdminUser'),
  async (req, res) => {
    try {
      const { role, isActive, name } = req.body;
      const updateFields = {};
      if (role !== undefined) updateFields.role = role;
      if (isActive !== undefined) updateFields.isActive = isActive;
      if (name !== undefined) updateFields.name = name;

      const admin = await AdminUser.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password');

      if (!admin)
        return res.status(404).json({ success: false, message: 'Admin not found.' });

      req._auditAfter = updateFields;
      res.json({ success: true, admin });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── DELETE /api/settings/admins/:id ──────────────────────────────────────────
router.delete(
  '/admins/:id',
  auth,
  allowRoles('super_admin'),
  auditLog('ADMIN_DELETED', 'AdminUser'),
  async (req, res) => {
    try {
      // Prevent deleting yourself
      if (req.params.id === String(req.admin.id)) {
        return res
          .status(400)
          .json({ success: false, message: 'You cannot delete your own account.' });
      }

      const admin = await AdminUser.findByIdAndDelete(req.params.id);
      if (!admin)
        return res.status(404).json({ success: false, message: 'Admin not found.' });

      req._auditAfter = { deleted: true, email: admin.email };
      res.json({ success: true, message: 'Admin user deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
