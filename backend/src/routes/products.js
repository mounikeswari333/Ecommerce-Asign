const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const { auditLog } = require('../middleware/auditLogger');

const router = express.Router();

// ── POST /api/products (Public/Seller Product Upload) ────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, category, subCategory, description, price, mrp, stock, unit, sellerId } = req.body;
    if (!name || !category || !price || !stock || !sellerId) {
      return res.status(400).json({ success: false, message: 'name, category, price, stock, and sellerId are required' });
    }

    const count = await Product.countDocuments();
    const productId = `PSPK-P-${String(100 + count).padStart(5, '0')}`;

    const product = await Product.create({
      productId,
      sellerId,
      name,
      category,
      subCategory: subCategory || '',
      description: description || 'Local organic dairy product',
      price: parseFloat(price),
      mrp: parseFloat(mrp || price),
      stock: parseInt(stock),
      unit: unit || 'unit',
      status: 'pending_approval',
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/products ─────────────────────────────────────────────────────────
// Query: ?status=live&seller=id&category=Milk&page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const { status, seller, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.admin.role === 'seller') {
      filter.sellerId = req.admin.id;
    } else {
      if (seller) filter.sellerId = seller;
    }
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('sellerId', 'businessName sellerId')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: parseInt(page), products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/products/approval-queue ─────────────────────────────────────────
router.get('/approval-queue', auth, async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending_approval' })
      .populate('sellerId', 'businessName sellerId')
      .sort({ createdAt: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/products/low-stock ───────────────────────────────────────────────
router.get('/low-stock', auth, async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 10 }, status: 'live' })
      .populate('sellerId', 'businessName sellerId')
      .sort({ stock: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/products/categories ─────────────────────────────────────────────
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/products/categories ────────────────────────────────────────────
router.post(
  '/categories',
  auth,
  allowRoles('super_admin', 'catalog_admin'),
  async (req, res) => {
    try {
      const { name, slug, parentCategory, icon } = req.body;
      if (!name || !slug) {
        return res
          .status(400)
          .json({ success: false, message: 'name and slug are required.' });
      }
      const category = await Category.create({ name, slug, parentCategory, icon });
      res.status(201).json({ success: true, category });
    } catch (err) {
      if (err.code === 11000)
        return res
          .status(409)
          .json({ success: false, message: 'Category name or slug already exists.' });
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/products/categories/:id ─────────────────────────────────────────
router.put(
  '/categories/:id',
  auth,
  allowRoles('super_admin', 'catalog_admin'),
  async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!category)
        return res.status(404).json({ success: false, message: 'Category not found.' });
      res.json({ success: true, category });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/products/:id/approve ─────────────────────────────────────────────
router.put(
  '/:id/approve',
  auth,
  allowRoles('super_admin', 'catalog_admin'),
  auditLog('PRODUCT_APPROVED', 'Product'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ success: false, message: 'Product not found.' });

      req._auditBefore = { status: product.status };
      product.status = 'live';
      product.approvedBy = req.admin.id;
      product.approvedAt = new Date();
      product.rejectionReason = '';
      await product.save();
      req._auditAfter = { status: 'live' };

      res.json({ success: true, message: 'Product approved and set to live.', product });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/products/:id/reject ──────────────────────────────────────────────
router.put(
  '/:id/reject',
  auth,
  allowRoles('super_admin', 'catalog_admin'),
  auditLog('PRODUCT_REJECTED', 'Product'),
  async (req, res) => {
    try {
      const { rejectionReason } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ success: false, message: 'Product not found.' });

      req._auditBefore = { status: product.status };
      product.status = 'rejected';
      product.rejectionReason = rejectionReason || 'Does not meet quality standards.';
      await product.save();
      req._auditAfter = { status: 'rejected', rejectionReason: product.rejectionReason };

      res.json({ success: true, message: 'Product rejected.', product });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── GET /api/products/public (Public Storefront Browse) ──────────────────────
router.get('/public', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'live' };
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const products = await Product.find(filter)
      .populate('sellerId', 'businessName sellerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/products/public/:id (Public Storefront Detail) ──────────────────
router.get('/public/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'businessName sellerId');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
