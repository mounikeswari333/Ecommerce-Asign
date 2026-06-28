const express = require('express');
const Seller = require('../models/Seller');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// ── GET /api/sellers ──────────────────────────────────────────────────────────
// Query: ?status=active&search=name&sort=createdAt
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { sellerId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sellers, total] = await Promise.all([
      Seller.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Seller.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sellers/onboarding-queue ─────────────────────────────────────────
router.get('/onboarding-queue', auth, async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: sellers.length, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sellers/:id ──────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-password');
    if (!seller)
      return res.status(404).json({ success: false, message: 'Seller not found.' });

    const [orders, paymentsAgg] = await Promise.all([
      Order.find({ sellerId: seller._id })
        .sort({ createdAt: -1 })
        .limit(20),
      Payment.aggregate([
        { $match: { sellerId: seller._id } },
        {
          $group: {
            _id: null,
            totalGross: { $sum: '$grossSaleAmount' },
            totalNet: { $sum: '$netPayoutAmount' },
            totalCommission: { $sum: '$platformCommission' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      seller,
      orders,
      paymentSummary: paymentsAgg[0] || {
        totalGross: 0,
        totalNet: 0,
        totalCommission: 0,
        count: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/sellers/:id/kyc/:docIndex ────────────────────────────────────────
router.put(
  '/:id/kyc/:docIndex',
  auth,
  auditLog('KYC_DOC_UPDATED', 'Seller'),
  async (req, res) => {
    try {
      const { status, rejectionReason } = req.body;
      const seller = await Seller.findById(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      const docIndex = parseInt(req.params.docIndex);
      if (!seller.kycDocs[docIndex]) {
        return res.status(404).json({ success: false, message: 'KYC document not found.' });
      }

      req._auditBefore = { kycDoc: seller.kycDocs[docIndex] };

      seller.kycDocs[docIndex].status = status;
      if (rejectionReason) seller.kycDocs[docIndex].rejectionReason = rejectionReason;
      await seller.save();

      req._auditAfter = { kycDoc: seller.kycDocs[docIndex] };

      res.json({ success: true, message: 'KYC document updated.', kycDoc: seller.kycDocs[docIndex] });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/sellers/:id/status ───────────────────────────────────────────────
router.put(
  '/:id/status',
  auth,
  auditLog('SELLER_STATUS_CHANGED', 'Seller'),
  async (req, res) => {
    try {
      const { status, reason } = req.body;
      const allowed = ['active', 'suspended', 'blacklisted', 'pending'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }

      const seller = await Seller.findById(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      req._auditBefore = { status: seller.status };
      seller.status = status;
      await seller.save();
      req._auditAfter = { status: seller.status, reason };

      res.json({ success: true, message: `Seller status updated to ${status}.`, seller });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/sellers/:id/commission ──────────────────────────────────────────
router.put(
  '/:id/commission',
  auth,
  allowRoles('super_admin', 'finance_admin'),
  auditLog('COMMISSION_UPDATED', 'Seller'),
  async (req, res) => {
    try {
      const { commissionRate } = req.body;
      if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
        return res
          .status(400)
          .json({ success: false, message: 'commissionRate must be between 0 and 100.' });
      }

      const seller = await Seller.findById(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      req._auditBefore = { commissionRate: seller.commissionRate };
      seller.commissionRate = commissionRate;
      await seller.save();
      req._auditAfter = { commissionRate: seller.commissionRate };

      res.json({ success: true, message: 'Commission rate updated.', seller });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── DELETE /api/sellers/:id ───────────────────────────────────────────────────
router.delete(
  '/:id',
  auth,
  allowRoles('super_admin'),
  auditLog('SELLER_DELETED', 'Seller'),
  async (req, res) => {
    try {
      const seller = await Seller.findByIdAndDelete(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      req._auditAfter = { deleted: true, sellerId: seller.sellerId };
      res.json({ success: true, message: 'Seller deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /api/sellers/:id/approve ─────────────────────────────────────────────
router.post(
  '/:id/approve',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  auditLog('SELLER_APPROVED', 'Seller'),
  async (req, res) => {
    try {
      const seller = await Seller.findById(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      req._auditBefore = { status: seller.status };
      seller.status = 'active';
      seller.onboardedAt = new Date();
      await seller.save();
      req._auditAfter = { status: 'active' };

      res.json({ success: true, message: 'Seller approved and activated.', seller });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /api/sellers/:id/reject ──────────────────────────────────────────────
router.post(
  '/:id/reject',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  auditLog('SELLER_REJECTED', 'Seller'),
  async (req, res) => {
    try {
      const { reason } = req.body;
      const seller = await Seller.findById(req.params.id);
      if (!seller)
        return res.status(404).json({ success: false, message: 'Seller not found.' });

      req._auditBefore = { status: seller.status };
      seller.status = 'suspended';
      await seller.save();
      req._auditAfter = { status: 'suspended', reason };

      res.json({ success: true, message: 'Seller rejected.', seller });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/sellers/:id (Update Seller Profile) ──────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    if (req.admin.role === 'seller' && req.admin.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      gstNumber,
      fssaiLicense,
      bankDetails,
      kycDocs,
    } = req.body;

    if (businessName) seller.businessName = businessName;
    if (ownerName) seller.ownerName = ownerName;
    if (phone) seller.phone = phone;
    if (email) seller.email = email.toLowerCase();
    if (address) seller.address = address;
    if (city) seller.city = city;
    if (state) seller.state = state;
    if (pincode) seller.pincode = pincode;
    if (gstNumber) seller.gstNumber = gstNumber;
    if (fssaiLicense) seller.fssaiLicense = fssaiLicense;
    if (bankDetails) {
      seller.bankDetails = {
        ...seller.bankDetails,
        ...bankDetails
      };
    }
    if (kycDocs) seller.kycDocs = kycDocs;

    await seller.save();
    res.json({ success: true, message: 'Profile updated successfully.', seller });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
