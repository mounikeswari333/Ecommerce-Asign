const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pashusevak_jwt_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required.' });
    }

    const admin = await AdminUser.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });
    }

    if (!admin.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account is deactivated. Contact super admin.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    const payload = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/register-seller ───────────────────────────────────────────
router.post('/register-seller', async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      phone,
      email,
      password,
      gstNumber,
      fssaiLicense,
      categories,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (!businessName || !ownerName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'businessName, ownerName, phone, email, and password are required.',
      });
    }

    const existing = await Seller.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already registered.' });
    }

    const seller = await Seller.create({
      businessName,
      ownerName,
      phone,
      email,
      password,
      gstNumber: gstNumber || '',
      fssaiLicense: fssaiLicense || '',
      categories: categories || [],
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Seller registered successfully. Awaiting admin approval.',
      sellerId: seller.sellerId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id).select('-password');
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Admin not found.' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

const Buyer = require('../models/Buyer');

// ── POST /api/auth/register-buyer (Public/Buyer) ─────────────────────────────
router.post('/register-buyer', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'name, email, phone, and password are required' });
    }
    const existing = await Buyer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const count = await Buyer.countDocuments();
    const buyerId = `PSPK-B-${String(100 + count).padStart(5, '0')}`;

    const buyer = await Buyer.create({
      buyerId,
      name,
      email,
      phone,
      password,
      addresses: address ? [address] : [],
    });

    res.status(201).json({ success: true, message: 'Buyer registered successfully', buyerId: buyer.buyerId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login-buyer (Public/Buyer) ────────────────────────────────
router.post('/login-buyer', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (!buyer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const isMatch = await buyer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const payload = { id: buyer._id, name: buyer.name, email: buyer.email, role: 'buyer' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      success: true,
      token,
      user: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        role: 'buyer',
        buyerId: buyer.buyerId,
        addresses: buyer.addresses
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login-seller (Public/Seller) ──────────────────────────────
router.post('/login-seller', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const seller = await Seller.findOne({ email: email.toLowerCase() });
    if (!seller) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (seller.status !== 'active') {
      return res.status(403).json({ success: false, message: `Your account is ${seller.status}. Contact administrator.` });
    }
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const payload = {
      id: seller._id,
      name: seller.ownerName,
      businessName: seller.businessName,
      email: seller.email,
      role: 'seller'
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      success: true,
      token,
      user: {
        id: seller._id,
        name: seller.ownerName,
        businessName: seller.businessName,
        email: seller.email,
        role: 'seller',
        sellerId: seller.sellerId
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
