const express = require('express');
const LogisticsPartner = require('../models/LogisticsPartner');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const router = express.Router();

// ── GET /api/logistics/partners ───────────────────────────────────────────────
router.get('/partners', auth, async (req, res) => {
  try {
    const partners = await LogisticsPartner.find().sort({ name: 1 });
    res.json({ success: true, count: partners.length, partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/logistics/partners ──────────────────────────────────────────────
router.post(
  '/partners',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  async (req, res) => {
    try {
      const { name, apiKey, isActive, codAvailable, avgDeliveryDays, serviceableStates } =
        req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Partner name is required.' });
      }
      const partner = await LogisticsPartner.create({
        name,
        apiKey,
        isActive,
        codAvailable,
        avgDeliveryDays,
        serviceableStates,
      });
      res.status(201).json({ success: true, partner });
    } catch (err) {
      if (err.code === 11000)
        return res
          .status(409)
          .json({ success: false, message: 'Partner with this name already exists.' });
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PUT /api/logistics/partners/:id ───────────────────────────────────────────
router.put(
  '/partners/:id',
  auth,
  allowRoles('super_admin', 'ops_admin'),
  async (req, res) => {
    try {
      const partner = await LogisticsPartner.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!partner)
        return res.status(404).json({ success: false, message: 'Partner not found.' });
      res.json({ success: true, partner });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── DELETE /api/logistics/partners/:id ────────────────────────────────────────
router.delete(
  '/partners/:id',
  auth,
  allowRoles('super_admin'),
  async (req, res) => {
    try {
      const partner = await LogisticsPartner.findByIdAndDelete(req.params.id);
      if (!partner)
        return res.status(404).json({ success: false, message: 'Partner not found.' });
      res.json({ success: true, message: 'Logistics partner deleted.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── GET /api/logistics/pickups ────────────────────────────────────────────────
// Orders that are 'packed' and using 'easy_ship' (ready for pickup scheduling)
router.get('/pickups', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      status: 'packed',
      shippingMode: 'easy_ship',
    })
      .populate('sellerId', 'businessName sellerId city state')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/logistics/pickups/:orderId/schedule ─────────────────────────────
// Body: { courierPartner, awbNumber }
router.post('/pickups/:orderId/schedule', auth, async (req, res) => {
  try {
    const { courierPartner, awbNumber } = req.body;
    if (!courierPartner || !awbNumber) {
      return res.status(400).json({
        success: false,
        message: 'courierPartner and awbNumber are required.',
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order)
      return res.status(404).json({ success: false, message: 'Order not found.' });

    order.courierPartner = courierPartner;
    order.awbNumber = awbNumber;
    order.status = 'in_transit';
    order.timeline.push({
      status: 'in_transit',
      timestamp: new Date(),
      note: `Pickup scheduled. Courier: ${courierPartner}, AWB: ${awbNumber}`,
    });
    await order.save();

    res.json({ success: true, message: 'Pickup scheduled and order set to in_transit.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Pincode to state mapper for India
function getStateFromPincode(pincode) {
  if (!pincode || pincode.length !== 6) return null;
  const digit = pincode.charAt(0);
  switch (digit) {
    case '1': return 'Delhi';
    case '2': return 'Uttar Pradesh';
    case '3': return 'Rajasthan';
    case '4': return 'Maharashtra';
    case '5': return 'Karnataka';
    case '6': return 'Tamil Nadu';
    case '7': return 'West Bengal';
    case '8': return 'Bihar';
    default: return 'Other';
  }
}

// ── POST /api/logistics/calculate-shipping ────────────────────────────────────
router.post('/calculate-shipping', async (req, res) => {
  try {
    const { pincode, sellerId } = req.body;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ success: false, message: 'A valid 6-digit pincode is required.' });
    }

    const state = getStateFromPincode(pincode);
    const partners = await LogisticsPartner.find({ isActive: true });
    
    const options = partners.map(partner => {
      const isServiceable = partner.serviceableStates.includes('All') || 
                            partner.serviceableStates.some(s => s.toLowerCase() === state.toLowerCase());
      
      if (!isServiceable) return null;

      let baseCost = 50;
      if (partner.name.toLowerCase() === 'bluedart') baseCost = 80;
      if (partner.name.toLowerCase() === 'dtdc') baseCost = 40;

      const numericPincode = parseInt(pincode);
      const variance = (numericPincode % 5) * 5;
      const shippingCost = baseCost + variance;

      const days = partner.avgDeliveryDays || 3;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      const estDateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

      return {
        courierPartner: partner.name,
        shippingCost,
        estimatedDelivery: `${days} days (by ${estDateStr})`,
        codAvailable: partner.codAvailable,
      };
    }).filter(Boolean);

    res.json({ success: true, options });
  } catch (err) {
    console.error('Calculate shipping error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
