require('dotenv').config();
const mongoose = require('mongoose');

const AdminUser = require('./models/AdminUser');
const Seller = require('./models/Seller');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const PayoutBatch = require('./models/PayoutBatch');
const LogisticsPartner = require('./models/LogisticsPartner');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const Buyer = require('./models/Buyer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pashusevak';

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // ── 1. Clear all collections ────────────────────────────────────────────────
  console.log('Clearing collections...');
  await Promise.all([
    AdminUser.deleteMany({}),
    Seller.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    PayoutBatch.deleteMany({}),
    LogisticsPartner.deleteMany({}),
    Category.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
    Buyer.deleteMany({}),
  ]);
  console.log('Collections cleared.');

  // ── 2. Create Admin Users ───────────────────────────────────────────────────
  console.log('Creating admin users...');
  const admins = await AdminUser.insertMany([
    {
      name: 'Super Admin',
      email: 'admin@pashusevak.com',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true,
    },
    {
      name: 'Ops Admin',
      email: 'ops@pashusevak.com',
      password: 'Admin@123',
      role: 'ops_admin',
      isActive: true,
    },
    {
      name: 'Finance Admin',
      email: 'finance@pashusevak.com',
      password: 'Admin@123',
      role: 'finance_admin',
      isActive: true,
    },
    {
      name: 'Catalog Admin',
      email: 'catalog@pashusevak.com',
      password: 'Admin@123',
      role: 'catalog_admin',
      isActive: true,
    },
    {
      name: 'Support Admin',
      email: 'support@pashusevak.com',
      password: 'Admin@123',
      role: 'support_admin',
      isActive: true,
    },
  ]);

  // insertMany doesn't trigger pre-save hook — hash passwords manually
  // NOTE: We use create() one-by-one to trigger the bcrypt pre-save hook properly
  await AdminUser.deleteMany({});
  const adminDocs = [];
  const adminData = [
    { name: 'Super Admin', email: 'admin@pashusevak.com', password: 'Admin@123', role: 'super_admin' },
    { name: 'Ops Admin', email: 'ops@pashusevak.com', password: 'Admin@123', role: 'ops_admin' },
    { name: 'Finance Admin', email: 'finance@pashusevak.com', password: 'Admin@123', role: 'finance_admin' },
    { name: 'Catalog Admin', email: 'catalog@pashusevak.com', password: 'Admin@123', role: 'catalog_admin' },
    { name: 'Support Admin', email: 'support@pashusevak.com', password: 'Admin@123', role: 'support_admin' },
  ];
  for (const data of adminData) {
    const a = await AdminUser.create(data);
    adminDocs.push(a);
  }
  const superAdmin = adminDocs[0];
  console.log(`Created ${adminDocs.length} admin users.`);

  // ── 3. Create Logistics Partners ────────────────────────────────────────────
  console.log('Creating logistics partners...');
  const partners = await LogisticsPartner.insertMany([
    {
      name: 'Delhivery',
      apiKey: 'dlv_test_key_001',
      isActive: true,
      codAvailable: true,
      avgDeliveryDays: 3,
      serviceableStates: ['Delhi', 'UP', 'Haryana', 'Punjab', 'Rajasthan', 'Maharashtra', 'Karnataka'],
    },
    {
      name: 'BlueDart',
      apiKey: 'bdt_test_key_002',
      isActive: true,
      codAvailable: false,
      avgDeliveryDays: 2,
      serviceableStates: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat'],
    },
    {
      name: 'DTDC',
      apiKey: 'dtdc_test_key_003',
      isActive: true,
      codAvailable: true,
      avgDeliveryDays: 4,
      serviceableStates: ['All'],
    },
  ]);
  console.log(`Created ${partners.length} logistics partners.`);

  // ── 4. Create Categories ─────────────────────────────────────────────────────
  console.log('Creating categories...');
  const categories = await Category.insertMany([
    { name: 'Milk', slug: 'milk', parentCategory: null, icon: 'milk-icon', isActive: true },
    { name: 'Ghee', slug: 'ghee', parentCategory: null, icon: 'ghee-icon', isActive: true },
    { name: 'Paneer', slug: 'paneer', parentCategory: null, icon: 'paneer-icon', isActive: true },
    { name: 'Cattle Feed', slug: 'cattle-feed', parentCategory: null, icon: 'feed-icon', isActive: true },
    { name: 'Equipment', slug: 'equipment', parentCategory: null, icon: 'equipment-icon', isActive: true },
  ]);
  console.log(`Created ${categories.length} categories.`);

  // ── 5. Create Sellers ────────────────────────────────────────────────────────
  console.log('Creating sellers...');
  const sellerData = [
    {
      businessName: 'Gau Kripa Dairy',
      ownerName: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'seller@pashusevak.com',
      password: 'Seller@123',
      address: '12 MG Road',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      gstNumber: '09AABCU9603R1ZP',
      fssaiLicense: 'FSSAI1234567890',
      categories: ['Milk', 'Ghee', 'Paneer'],
      status: 'active',
      commissionRate: 5,
      bankDetails: {
        accountNo: '11223344556677',
        ifsc: 'SBIN0001234',
        accountHolder: 'Ramesh Kumar',
        bankName: 'State Bank of India',
      },
      performanceScore: { fulfillmentRate: 92, returnRate: 3, avgRating: 4.5 },
      onboardedAt: daysAgo(120),
    },
    {
      businessName: 'Prabhat Milk Products',
      ownerName: 'Sita Devi',
      phone: '9765432109',
      email: 'sita@prabhatmilk.com',
      password: 'Seller@123',
      address: '55 Dairy Colony',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      gstNumber: '08AABCU9603R1ZX',
      fssaiLicense: 'FSSAI9876543210',
      categories: ['Milk', 'Paneer'],
      status: 'active',
      commissionRate: 5,
      bankDetails: {
        accountNo: '22334455667788',
        ifsc: 'HDFC0001234',
        accountHolder: 'Sita Devi',
        bankName: 'HDFC Bank',
      },
      performanceScore: { fulfillmentRate: 88, returnRate: 5, avgRating: 4.2 },
      onboardedAt: daysAgo(90),
    },
    {
      businessName: 'Shreenath Agro Feeds',
      ownerName: 'Vijay Patel',
      phone: '9654321098',
      email: 'vijay@shreenathagro.com',
      password: 'Seller@123',
      address: '7 Industrial Estate',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      gstNumber: '24AABCU9603R1ZQ',
      fssaiLicense: 'FSSAI1122334455',
      categories: ['Cattle Feed', 'Equipment'],
      status: 'active',
      commissionRate: 5,
      bankDetails: {
        accountNo: '33445566778899',
        ifsc: 'ICIC0001234',
        accountHolder: 'Vijay Patel',
        bankName: 'ICICI Bank',
      },
      performanceScore: { fulfillmentRate: 90, returnRate: 2, avgRating: 4.4 },
    },
    {
      businessName: 'Nandini Ghee House',
      ownerName: 'Meena Sharma',
      phone: '9543210987',
      email: 'meena@nandinighee.com',
      password: 'Seller@123',
      address: '23 Temple Street',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
      gstNumber: '09AABCU9604R1ZP',
      fssaiLicense: 'FSSAI5544332211',
      categories: ['Ghee'],
      status: 'active',
      commissionRate: 4,
      bankDetails: {
        accountNo: '44556677889900',
        ifsc: 'PUNB0001234',
        accountHolder: 'Meena Sharma',
        bankName: 'Punjab National Bank',
      },
      performanceScore: { fulfillmentRate: 95, returnRate: 2, avgRating: 4.8 },
      onboardedAt: daysAgo(60),
    },
    {
      businessName: 'Krishna Dairy Equipments',
      ownerName: 'Suresh Yadav',
      phone: '9432109876',
      email: 'suresh@krishnadairy.com',
      password: 'Seller@123',
      address: '9 MIDC Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      gstNumber: '27AABCU9603R1ZR',
      fssaiLicense: 'FSSAI6677889900',
      categories: ['Equipment', 'Cattle Feed'],
      status: 'active',
      commissionRate: 5,
      bankDetails: {
        accountNo: '55667788990011',
        ifsc: 'AXIS0001234',
        accountHolder: 'Suresh Yadav',
        bankName: 'Axis Bank',
      },
      performanceScore: { fulfillmentRate: 85, returnRate: 5, avgRating: 4.1 },
      onboardedAt: daysAgo(180),
    },
  ];

  const sellers = [];
  for (const data of sellerData) {
    const s = await Seller.create(data);
    sellers.push(s);
  }
  console.log(`Created ${sellers.length} sellers.`);

  // ── 6. Create Products (Fewer items, 10 in total with unique Unsplash images) ──
  console.log('Creating products...');
  const productTemplates = [
    // Seller 0 – Gau Kripa Dairy (active)
    [
      { 
        name: 'Fresh Cow Milk 1L', 
        category: 'Milk', 
        price: 60, 
        mrp: 65, 
        stock: 500, 
        unit: 'litre', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600']
      },
      { 
        name: 'Pure Desi Cow Ghee 500g', 
        category: 'Ghee', 
        price: 450, 
        mrp: 500, 
        stock: 120, 
        unit: 'pack', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=600']
      },
      { 
        name: 'Fresh Malai Paneer 200g', 
        category: 'Paneer', 
        price: 80, 
        mrp: 90, 
        stock: 150, 
        unit: 'pack', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600']
      },
    ],
    // Seller 1 – Prabhat Milk Products (active)
    [
      { 
        name: 'Organic Toned Milk 500ml', 
        category: 'Milk', 
        price: 30, 
        mrp: 32, 
        stock: 200, 
        unit: 'pack', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=600']
      },
      { 
        name: 'Organic Block Paneer 500g', 
        category: 'Paneer', 
        price: 180, 
        mrp: 200, 
        stock: 80, 
        unit: 'pack', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=600']
      },
    ],
    // Seller 2 – Shreenath Agro Feeds (active)
    [
      { 
        name: 'Premium Cattle Feed Mix 25kg', 
        category: 'Cattle Feed', 
        price: 1200, 
        mrp: 1400, 
        stock: 50, 
        unit: 'kg', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1595273670150-db0a3e368167?auto=format&fit=crop&q=80&w=600']
      },
      { 
        name: 'Handheld Milking Machine', 
        category: 'Equipment', 
        price: 9500, 
        mrp: 11000, 
        stock: 15, 
        unit: 'unit', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600']
      },
    ],
    // Seller 3 – Nandini Ghee House (active)
    [
      { 
        name: 'Traditional A2 Ghee 1L', 
        category: 'Ghee', 
        price: 900, 
        mrp: 1000, 
        stock: 70, 
        unit: 'litre', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1622484211148-71694f71587a?auto=format&fit=crop&q=80&w=600']
      },
    ],
    // Seller 4 – Krishna Dairy Equipments (active)
    [
      { 
        name: 'Nutrient Mineral Blocks 5kg', 
        category: 'Cattle Feed', 
        price: 350, 
        mrp: 400, 
        stock: 100, 
        unit: 'kg', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600']
      },
      { 
        name: 'Heavy-duty Milk Chiller 50L', 
        category: 'Equipment', 
        price: 45000, 
        mrp: 50000, 
        stock: 5, 
        unit: 'unit', 
        status: 'live',
        images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600']
      },
    ],
  ];

  const allProducts = [];
  for (let i = 0; i < sellers.length; i++) {
    for (const pt of productTemplates[i]) {
      const p = await Product.create({
        sellerId: sellers[i]._id,
        ...pt,
        description: `High quality ${pt.name} from ${sellers[i].businessName}`,
        approvedBy: pt.status === 'live' ? superAdmin._id : null,
        approvedAt: pt.status === 'live' ? daysAgo(randomBetween(1, 90)) : null,
      });
      allProducts.push(p);
    }
  }
  console.log(`Created ${allProducts.length} products.`);

  // ── 6.5 Create Buyers ────────────────────────────────────────────────────────
  console.log('Creating buyers...');
  const buyer = await Buyer.create({
    buyerId: 'PSPK-B-00001',
    name: 'Amit Buyer',
    email: 'buyer@pashusevak.com',
    phone: '9812345678',
    password: 'Buyer@123',
    addresses: [
      { label: 'Home', line1: '123 Sweet Cow Colony', city: 'Pune', state: 'Maharashtra', pincode: '411001', isDefault: true }
    ]
  });

  // ── 7. Create Orders ─────────────────────────────────────────────────────────
  console.log('Creating orders...');
  const orderStatuses = [
    'placed', 'packed', 'in_transit', 'out_for_delivery', 'delivered',
    'delivered', 'delivered', 'delivered', 'delivered', 'delivered',
    'cancelled', 'returned', 'rto', 'placed', 'in_transit',
    'delivered', 'delivered', 'packed', 'out_for_delivery', 'delivered',
  ];

  const buyerNames = [
    'Anita Singh', 'Raj Malhotra', 'Priya Joshi', 'Deepak Verma',
    'Kavya Nair', 'Mohan Lal', 'Sunita Rao', 'Harish Gupta',
    'Neha Mishra', 'Arun Tiwari',
  ];

  const allOrders = [];
  for (let i = 0; i < 20; i++) {
    const seller = sellers[i % 2]; // Use only active sellers (0 & 1)
    const product = allProducts.find(
      (p) => p.sellerId.toString() === seller._id.toString() && p.status === 'live'
    );
    if (!product) continue;

    const qty = randomBetween(1, 5);
    const grossAmount = qty * product.price;
    const status = orderStatuses[i];
    const createdAt = daysAgo(randomBetween(1, 30));

    const timeline = [{ status: 'placed', timestamp: createdAt, note: 'Order placed by customer' }];
    if (['packed', 'in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({ status: 'packed', timestamp: new Date(createdAt.getTime() + 2 * 3600000), note: 'Packed by seller' });
    }
    if (['in_transit', 'out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({ status: 'in_transit', timestamp: new Date(createdAt.getTime() + 24 * 3600000), note: 'Picked up by courier' });
    }
    if (['out_for_delivery', 'delivered'].includes(status)) {
      timeline.push({ status: 'out_for_delivery', timestamp: new Date(createdAt.getTime() + 48 * 3600000), note: 'Out for delivery' });
    }
    if (status === 'delivered') {
      timeline.push({ status: 'delivered', timestamp: new Date(createdAt.getTime() + 72 * 3600000), note: 'Delivered to customer' });
    }
    if (status === 'cancelled') {
      timeline.push({ status: 'cancelled', timestamp: new Date(createdAt.getTime() + 3600000), note: 'Cancelled by customer' });
    }
    if (status === 'returned') {
      timeline.push({ status: 'returned', timestamp: new Date(createdAt.getTime() + 5 * 24 * 3600000), note: 'Returned by customer' });
    }
    if (status === 'rto') {
      timeline.push({ status: 'rto', timestamp: new Date(createdAt.getTime() + 6 * 24 * 3600000), note: 'RTO initiated by courier' });
    }

    const buyerAddr = {
      line1: `${randomBetween(1, 999)} Main Road`,
      city: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bengaluru'][i % 5],
      state: ['Delhi', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Karnataka'][i % 5],
      pincode: `${randomBetween(100000, 999999)}`,
    };

    const order = await Order.create({
      sellerId: seller._id,
      buyerId: buyer.buyerId,
      buyerName: buyerNames[i % buyerNames.length],
      buyerPhone: `98${String(randomBetween(10000000, 99999999))}`,
      buyerAddress: buyerAddr,
      deliveryAddress: buyerAddr,
      items: [
        {
          productId: product._id,
          name: product.name,
          qty,
          price: product.price,
        },
      ],
      grossAmount,
      status,
      paymentMode: i % 3 === 0 ? 'prepaid' : 'COD',
      paymentStatus: status === 'delivered' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
      shippingMode: 'easy_ship',
      courierPartner: ['in_transit', 'out_for_delivery', 'delivered'].includes(status) ? 'Delhivery' : '',
      awbNumber: ['in_transit', 'out_for_delivery', 'delivered'].includes(status)
        ? `DLV${randomBetween(1000000, 9999999)}`
        : '',
      timeline,
      createdAt,
    });
    allOrders.push(order);
  }
  console.log(`Created ${allOrders.length} orders.`);

  // ── 8. Create Payments for delivered orders ────────────────────────────────
  console.log('Creating payments...');
  const deliveredOrders = allOrders.filter((o) => o.status === 'delivered');
  const allPayments = [];
  for (const order of deliveredOrders) {
    const payment = await Payment.create({
      orderId: order._id,
      sellerId: order.sellerId,
      grossSaleAmount: order.grossAmount,
      logisticsCost: randomBetween(40, 80),
      taxes: parseFloat((order.grossAmount * 0.05).toFixed(2)),
      adjustments: 0,
      payoutStatus: Math.random() > 0.5 ? 'settled' : 'pending',
      settledAt: Math.random() > 0.5 ? daysAgo(randomBetween(1, 10)) : null,
    });
    allPayments.push(payment);
  }
  console.log(`Created ${allPayments.length} payment records.`);

  // ── 9. Create Payout Batches ────────────────────────────────────────────────
  console.log('Creating payout batches...');
  const sellerPayments0 = allPayments.filter(
    (p) => p.sellerId.toString() === sellers[0]._id.toString()
  );
  const sellerPayments1 = allPayments.filter(
    (p) => p.sellerId.toString() === sellers[1]._id.toString()
  );

  if (sellerPayments0.length > 0) {
    const totalGross0 = sellerPayments0.reduce((s, p) => s + p.grossSaleAmount, 0);
    const totalNet0 = sellerPayments0.reduce((s, p) => s + p.netPayoutAmount, 0);
    const batch1 = await PayoutBatch.create({
      sellerId: sellers[0]._id,
      periodStart: daysAgo(14),
      periodEnd: daysAgo(7),
      totalOrders: sellerPayments0.length,
      totalGross: totalGross0,
      totalNetPayout: totalNet0,
      status: 'completed',
      bankUTR: `UTR${randomBetween(100000000000, 999999999999)}`,
      releasedBy: superAdmin._id,
      releasedAt: daysAgo(7),
    });
    console.log(`Payout batch 1 created: ${batch1.batchId}`);
  }

  if (sellerPayments1.length > 0) {
    const totalGross1 = sellerPayments1.reduce((s, p) => s + p.grossSaleAmount, 0);
    const totalNet1 = sellerPayments1.reduce((s, p) => s + p.netPayoutAmount, 0);
    const batch2 = await PayoutBatch.create({
      sellerId: sellers[1]._id,
      periodStart: daysAgo(7),
      periodEnd: new Date(),
      totalOrders: sellerPayments1.length,
      totalGross: totalGross1,
      totalNetPayout: totalNet1,
      status: 'scheduled',
      releasedBy: null,
    });
    console.log(`Payout batch 2 created: ${batch2.batchId}`);
  }

  // ── 10. Create Notifications ─────────────────────────────────────────────────
  console.log('Creating notifications...');
  await Notification.insertMany([
    {
      type: 'seller_signup',
      title: 'New Seller Registered',
      message: 'Shreenath Agro Feeds has submitted onboarding request. KYC pending.',
      targetRole: 'ops_admin',
      isRead: false,
      relatedId: sellers[2].sellerId,
    },
    {
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Toned Milk 500ml from Prabhat Milk Products has only 5 units left.',
      targetRole: 'all',
      isRead: false,
      relatedId: allProducts.find((p) => p.name === 'Toned Milk 500ml')?._id?.toString() || '',
    },
    {
      type: 'kyc_pending',
      title: 'KYC Documents Pending Review',
      message: '3 sellers have KYC documents awaiting verification.',
      targetRole: 'ops_admin',
      isRead: false,
      relatedId: '',
    },
    {
      type: 'payout_failed',
      title: 'Payout Processing Issue',
      message: 'Payout for Gau Kripa Dairy could not be processed due to bank details mismatch.',
      targetRole: 'finance_admin',
      isRead: true,
      relatedId: sellers[0].sellerId,
    },
    {
      type: 'complaint',
      title: 'Customer Complaint Received',
      message: 'Customer reported damaged packaging for Order ORD-34521.',
      targetRole: 'support_admin',
      isRead: false,
      relatedId: allOrders[0]?.orderId || '',
    },
  ]);
  console.log('Created 5 notifications.');

  console.log('\n✅  Seed complete!');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.connection.close();
  process.exit(1);
});
