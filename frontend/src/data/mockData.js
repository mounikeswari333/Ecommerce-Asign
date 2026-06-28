// Mock data for PashuSevak Admin Portal
// Used when backend is not available (development/demo mode)

export const MOCK_ADMIN = {
  _id: 'admin-001',
  name: 'Priya Sharma',
  email: 'admin@pashusevak.com',
  role: 'super_admin',
  isActive: true,
};

export const MOCK_SELLERS = [
  { _id: 's1', sellerId: 'PSPK-S-00142', businessName: 'Rajan Dairy Farm', ownerName: 'Rajan Kumar', phone: '9876543210', email: 'rajan@rajandairy.com', city: 'Lucknow', state: 'Uttar Pradesh', status: 'active', commissionRate: 5, categories: ['Milk', 'Paneer'], performanceScore: { fulfillmentRate: 94, returnRate: 2.1, avgRating: 4.5 }, gstNumber: '09AABCR1234A1Z5', fssaiLicense: '12345678901234', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'verified' }, { type: 'FSSAI License', url: '#', status: 'verified' }], onboardedAt: '2024-01-15', lastActiveAt: '2026-06-25', totalOrders: 1284, totalGross: 245800 },
  { _id: 's2', sellerId: 'PSPK-S-00143', businessName: 'NutriCow Feeds', ownerName: 'Suresh Mehta', phone: '9876543211', email: 'suresh@nutricow.com', city: 'Jaipur', state: 'Rajasthan', status: 'active', commissionRate: 4.5, categories: ['Cattle Feed', 'Equipment'], performanceScore: { fulfillmentRate: 88, returnRate: 3.5, avgRating: 4.2 }, gstNumber: '08AABCS5678B2Z6', fssaiLicense: '23456789012345', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'verified' }, { type: 'FSSAI License', url: '#', status: 'pending' }], onboardedAt: '2024-02-20', lastActiveAt: '2026-06-24', totalOrders: 892, totalGross: 184500 },
  { _id: 's3', sellerId: 'PSPK-S-00144', businessName: 'Mahesh Ghee House', ownerName: 'Mahesh Agarwal', phone: '9876543212', email: 'mahesh@maheshghee.com', city: 'Nagpur', state: 'Maharashtra', status: 'active', commissionRate: 5.5, categories: ['Ghee', 'Milk'], performanceScore: { fulfillmentRate: 97, returnRate: 1.2, avgRating: 4.8 }, gstNumber: '27AABCM9012C3Z7', fssaiLicense: '34567890123456', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'verified' }, { type: 'FSSAI License', url: '#', status: 'verified' }], onboardedAt: '2024-03-10', lastActiveAt: '2026-06-25', totalOrders: 2156, totalGross: 512300 },
  { _id: 's4', sellerId: 'PSPK-S-00145', businessName: 'Paneer Palace', ownerName: 'Anita Singh', phone: '9876543213', email: 'anita@paneerfarm.com', city: 'Delhi', state: 'Delhi', status: 'suspended', commissionRate: 5, categories: ['Paneer', 'Milk'], performanceScore: { fulfillmentRate: 72, returnRate: 8.4, avgRating: 3.1 }, gstNumber: '07AABCP3456D4Z8', fssaiLicense: '45678901234567', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'verified' }, { type: 'FSSAI License', url: '#', status: 'rejected' }], onboardedAt: '2024-04-05', lastActiveAt: '2026-06-10', totalOrders: 345, totalGross: 78900 },
  { _id: 's5', sellerId: 'PSPK-S-00146', businessName: 'Sunrise Dairy', ownerName: 'Vikram Patel', phone: '9876543214', email: 'vikram@sunrisedairy.com', city: 'Ahmedabad', state: 'Gujarat', status: 'pending', commissionRate: 5, categories: ['Milk', 'Ghee', 'Paneer'], performanceScore: { fulfillmentRate: 0, returnRate: 0, avgRating: 0 }, gstNumber: '24AABCS7890E5Z9', fssaiLicense: '56789012345678', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'pending' }, { type: 'FSSAI License', url: '#', status: 'pending' }], onboardedAt: '2026-06-20', lastActiveAt: '2026-06-20', totalOrders: 0, totalGross: 0 },
  { _id: 's6', sellerId: 'PSPK-S-00147', businessName: 'Govardhan Organics', ownerName: 'Deepak Yadav', phone: '9876543215', email: 'deepak@govardhan.com', city: 'Pune', state: 'Maharashtra', status: 'pending', commissionRate: 5, categories: ['Milk', 'Cattle Feed'], performanceScore: { fulfillmentRate: 0, returnRate: 0, avgRating: 0 }, gstNumber: '27AABCG2345F6Z0', fssaiLicense: '67890123456789', kycDocs: [{ type: 'GST Certificate', url: '#', status: 'pending' }, { type: 'FSSAI License', url: '#', status: 'pending' }], onboardedAt: '2026-06-22', lastActiveAt: '2026-06-22', totalOrders: 0, totalGross: 0 },
];

export const MOCK_PRODUCTS = [
  { _id: 'p1', productId: 'PSPK-P-00001', sellerId: 's1', sellerName: 'Rajan Dairy Farm', name: 'Fresh Full Cream Milk 1L', category: 'Milk', subCategory: 'Full Cream', price: 68, mrp: 72, stock: 450, unit: 'litre', status: 'live', images: [], description: 'Farm fresh full cream milk, directly sourced from healthy cows.', createdAt: '2024-01-20' },
  { _id: 'p2', productId: 'PSPK-P-00002', sellerId: 's2', sellerName: 'NutriCow Feeds', name: 'NutriCow Feed 5kg', category: 'Cattle Feed', subCategory: 'Dry Feed', price: 870, mrp: 950, stock: 8, unit: 'kg', status: 'live', images: [], description: 'High nutrition cattle feed with balanced minerals.', createdAt: '2024-02-25' },
  { _id: 'p3', productId: 'PSPK-P-00003', sellerId: 's3', sellerName: 'Mahesh Ghee House', name: 'Pure Desi Ghee 500ml', category: 'Ghee', subCategory: 'Desi Ghee', price: 450, mrp: 520, stock: 120, unit: 'pack', status: 'live', images: [], description: 'Traditional bilona process desi cow ghee.', createdAt: '2024-03-15' },
  { _id: 'p4', productId: 'PSPK-P-00004', sellerId: 's1', sellerName: 'Rajan Dairy Farm', name: 'Fresh Paneer 250g', category: 'Paneer', subCategory: 'Soft Paneer', price: 120, mrp: 140, stock: 5, unit: 'pack', status: 'live', images: [], description: 'Soft and fresh paneer made daily.', createdAt: '2024-01-22' },
  { _id: 'p5', productId: 'PSPK-P-00005', sellerId: 's4', sellerName: 'Paneer Palace', name: 'Hard Paneer 500g', category: 'Paneer', subCategory: 'Hard Paneer', price: 220, mrp: 260, stock: 30, unit: 'pack', status: 'pending_approval', images: [], description: 'Firm paneer ideal for grilling and frying.', createdAt: '2026-06-20' },
  { _id: 'p6', productId: 'PSPK-P-00006', sellerId: 's2', sellerName: 'NutriCow Feeds', name: 'Silage Wrapper Pro', category: 'Equipment', subCategory: 'Farm Tools', price: 12500, mrp: 14000, stock: 15, unit: 'unit', status: 'pending_approval', images: [], description: 'Industrial grade silage wrapper for large farms.', createdAt: '2026-06-22' },
  { _id: 'p7', productId: 'PSPK-P-00007', sellerId: 's3', sellerName: 'Mahesh Ghee House', name: 'A2 Cow Ghee 1L', category: 'Ghee', subCategory: 'A2 Ghee', price: 950, mrp: 1100, stock: 0, unit: 'pack', status: 'out_of_stock', images: [], description: 'Premium A2 cow ghee from Gir cows.', createdAt: '2024-04-01' },
  { _id: 'p8', productId: 'PSPK-P-00008', sellerId: 's1', sellerName: 'Rajan Dairy Farm', name: 'Low Fat Milk 500ml', category: 'Milk', subCategory: 'Low Fat', price: 32, mrp: 36, stock: 7, unit: 'litre', status: 'live', images: [], description: 'Low fat milk ideal for health-conscious consumers.', createdAt: '2024-02-10' },
];

const today = new Date();
const d = (daysBack) => new Date(today - daysBack * 86400000).toISOString();

export const MOCK_ORDERS = [
  { _id: 'o1', orderId: 'ORD-8818', sellerId: 's2', sellerName: 'NutriCow Feeds', buyerName: 'Suresh P.', buyerPhone: '9812345678', buyerAddress: { line1: '45 Civil Lines', city: 'Lucknow', state: 'UP', pincode: '226001' }, items: [{ name: 'NutriCow Feed 5kg', qty: 1, price: 870 }], grossAmount: 870, status: 'in_transit', paymentMode: 'COD', paymentStatus: 'pending', shippingMode: 'easy_ship', courierPartner: 'Delhivery', awbNumber: 'DL1234567890', timeline: [{ status: 'Order Placed', timestamp: d(2) + 'T12:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(2) + 'T14:00:00Z', note: 'Packed and ready for pickup' }, { status: 'In Transit', timestamp: d(1) + 'T09:00:00Z', note: 'Picked up by Delhivery' }], createdAt: d(2) },
  { _id: 'o2', orderId: 'ORD-8819', sellerId: 's1', sellerName: 'Rajan Dairy Farm', buyerName: 'Ananya K.', buyerPhone: '9887654321', buyerAddress: { line1: '12 MG Road', city: 'Jaipur', state: 'RJ', pincode: '302001' }, items: [{ name: 'Fresh Full Cream Milk 1L', qty: 5, price: 68 }, { name: 'Fresh Paneer 250g', qty: 2, price: 120 }], grossAmount: 580, status: 'out_for_delivery', paymentMode: 'prepaid', paymentStatus: 'paid', shippingMode: 'easy_ship', courierPartner: 'BlueDart', awbNumber: 'BD9876543210', timeline: [{ status: 'Order Placed', timestamp: d(3) + 'T10:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(3) + 'T16:00:00Z', note: '' }, { status: 'In Transit', timestamp: d(2) + 'T08:00:00Z', note: '' }, { status: 'Out for Delivery', timestamp: d(0) + 'T07:30:00Z', note: 'With delivery agent Ramesh' }], createdAt: d(3) },
  { _id: 'o3', orderId: 'ORD-8820', sellerId: 's3', sellerName: 'Mahesh Ghee House', buyerName: 'Pradeep M.', buyerPhone: '9834567890', buyerAddress: { line1: '78 Shivaji Nagar', city: 'Pune', state: 'MH', pincode: '411005' }, items: [{ name: 'Pure Desi Ghee 500ml', qty: 2, price: 450 }], grossAmount: 900, status: 'delivered', paymentMode: 'prepaid', paymentStatus: 'paid', shippingMode: 'easy_ship', courierPartner: 'Delhivery', awbNumber: 'DL0987654321', timeline: [{ status: 'Order Placed', timestamp: d(5) + 'T09:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(5) + 'T13:00:00Z', note: '' }, { status: 'In Transit', timestamp: d(4) + 'T09:00:00Z', note: '' }, { status: 'Out for Delivery', timestamp: d(1) + 'T08:00:00Z', note: '' }, { status: 'Delivered', timestamp: d(1) + 'T14:30:00Z', note: 'Left with neighbour' }], createdAt: d(5) },
  { _id: 'o4', orderId: 'ORD-8821', sellerId: 's1', sellerName: 'Rajan Dairy Farm', buyerName: 'Kavita R.', buyerPhone: '9800012345', buyerAddress: { line1: '5 Sector 22', city: 'Gurugram', state: 'HR', pincode: '122001' }, items: [{ name: 'Low Fat Milk 500ml', qty: 10, price: 32 }], grossAmount: 320, status: 'placed', paymentMode: 'COD', paymentStatus: 'pending', shippingMode: 'easy_ship', courierPartner: '', awbNumber: '', timeline: [{ status: 'Order Placed', timestamp: d(0) + 'T11:00:00Z', note: '' }], createdAt: d(0) },
  { _id: 'o5', orderId: 'ORD-8822', sellerId: 's3', sellerName: 'Mahesh Ghee House', buyerName: 'Rajat S.', buyerPhone: '9845678901', buyerAddress: { line1: '33 Civil Lines', city: 'Agra', state: 'UP', pincode: '282001' }, items: [{ name: 'A2 Cow Ghee 1L', qty: 1, price: 950 }], grossAmount: 950, status: 'cancelled', paymentMode: 'prepaid', paymentStatus: 'refunded', shippingMode: 'easy_ship', courierPartner: 'DTDC', awbNumber: '', timeline: [{ status: 'Order Placed', timestamp: d(4) + 'T10:00:00Z', note: '' }, { status: 'Cancelled', timestamp: d(4) + 'T18:00:00Z', note: 'Buyer requested cancellation' }], createdAt: d(4) },
  { _id: 'o6', orderId: 'ORD-8823', sellerId: 's2', sellerName: 'NutriCow Feeds', buyerName: 'Mohan L.', buyerPhone: '9823456789', buyerAddress: { line1: '19 Ashok Nagar', city: 'Bhopal', state: 'MP', pincode: '462001' }, items: [{ name: 'NutriCow Feed 5kg', qty: 3, price: 870 }], grossAmount: 2610, status: 'packed', paymentMode: 'COD', paymentStatus: 'pending', shippingMode: 'easy_ship', courierPartner: 'Delhivery', awbNumber: '', timeline: [{ status: 'Order Placed', timestamp: d(1) + 'T09:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(0) + 'T10:00:00Z', note: 'Ready for pickup' }], createdAt: d(1) },
  { _id: 'o7', orderId: 'ORD-8824', sellerId: 's3', sellerName: 'Mahesh Ghee House', buyerName: 'Shilpa V.', buyerPhone: '9867890123', buyerAddress: { line1: '7 Banjara Hills', city: 'Hyderabad', state: 'TS', pincode: '500034' }, items: [{ name: 'Pure Desi Ghee 500ml', qty: 3, price: 450 }], grossAmount: 1350, status: 'delivered', paymentMode: 'prepaid', paymentStatus: 'paid', shippingMode: 'easy_ship', courierPartner: 'BlueDart', awbNumber: 'BD1234509876', timeline: [{ status: 'Order Placed', timestamp: d(7) + 'T08:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(7) + 'T14:00:00Z', note: '' }, { status: 'In Transit', timestamp: d(6) + 'T09:00:00Z', note: '' }, { status: 'Out for Delivery', timestamp: d(5) + 'T08:00:00Z', note: '' }, { status: 'Delivered', timestamp: d(5) + 'T11:00:00Z', note: '' }], createdAt: d(7) },
  { _id: 'o8', orderId: 'ORD-8825', sellerId: 's1', sellerName: 'Rajan Dairy Farm', buyerName: 'Nita B.', buyerPhone: '9890123456', buyerAddress: { line1: '23 Salt Lake', city: 'Kolkata', state: 'WB', pincode: '700064' }, items: [{ name: 'Fresh Full Cream Milk 1L', qty: 8, price: 68 }], grossAmount: 544, status: 'rto', paymentMode: 'COD', paymentStatus: 'pending', shippingMode: 'easy_ship', courierPartner: 'Delhivery', awbNumber: 'DL2345678901', timeline: [{ status: 'Order Placed', timestamp: d(10) + 'T10:00:00Z', note: '' }, { status: 'Seller Packed', timestamp: d(10) + 'T15:00:00Z', note: '' }, { status: 'In Transit', timestamp: d(9) + 'T09:00:00Z', note: '' }, { status: 'Out for Delivery', timestamp: d(8) + 'T08:00:00Z', note: '' }, { status: 'RTO Initiated', timestamp: d(7) + 'T18:00:00Z', note: 'Delivery failed 3 attempts. Returning to seller.' }], createdAt: d(10) },
];

export const MOCK_PAYMENTS = [
  { _id: 'pay1', paymentId: 'PAY-00001', orderId: 'o3', orderRef: 'ORD-8820', sellerId: 's3', sellerName: 'Mahesh Ghee House', grossSaleAmount: 900, platformCommission: 49.5, paymentGatewayFee: 22.5, logisticsCost: 55, taxes: 8.91, adjustments: 0, netPayoutAmount: 764.09, payoutStatus: 'settled', payoutBatchId: 'batch1', settledAt: d(0), createdAt: d(5) },
  { _id: 'pay2', paymentId: 'PAY-00002', orderId: 'o7', orderRef: 'ORD-8824', sellerId: 's3', sellerName: 'Mahesh Ghee House', grossSaleAmount: 1350, platformCommission: 74.25, paymentGatewayFee: 33.75, logisticsCost: 65, taxes: 13.37, adjustments: 0, netPayoutAmount: 1163.63, payoutStatus: 'pending', payoutBatchId: null, settledAt: null, createdAt: d(7) },
  { _id: 'pay3', paymentId: 'PAY-00003', orderId: 'o2', orderRef: 'ORD-8819', sellerId: 's1', sellerName: 'Rajan Dairy Farm', grossSaleAmount: 580, platformCommission: 29, paymentGatewayFee: 14.5, logisticsCost: 50, taxes: 5.22, adjustments: 0, netPayoutAmount: 481.28, payoutStatus: 'pending', payoutBatchId: null, settledAt: null, createdAt: d(3) },
  { _id: 'pay4', paymentId: 'PAY-00004', orderId: 'o1', orderRef: 'ORD-8818', sellerId: 's2', sellerName: 'NutriCow Feeds', grossSaleAmount: 870, platformCommission: 43.5, paymentGatewayFee: 0, logisticsCost: 60, taxes: 7.83, adjustments: 0, netPayoutAmount: 758.67, payoutStatus: 'on_hold', payoutBatchId: null, settledAt: null, createdAt: d(2) },
];

export const MOCK_PAYOUT_BATCHES = [
  { _id: 'batch1', batchId: 'BATCH-00001', sellerId: 's3', sellerName: 'Mahesh Ghee House', periodStart: d(14), periodEnd: d(7), totalOrders: 12, totalGross: 15600, totalNetPayout: 13200, status: 'completed', bankUTR: 'UTR202406150001', releasedAt: d(3), createdAt: d(5) },
  { _id: 'batch2', batchId: 'BATCH-00002', sellerId: 's1', sellerName: 'Rajan Dairy Farm', periodStart: d(7), periodEnd: d(0), totalOrders: 8, totalGross: 9800, totalNetPayout: 8450, status: 'processing', bankUTR: '', releasedAt: d(1), createdAt: d(1) },
  { _id: 'batch3', batchId: 'BATCH-00003', sellerId: 's2', sellerName: 'NutriCow Feeds', periodStart: d(7), periodEnd: d(0), totalOrders: 5, totalGross: 12400, totalNetPayout: 10900, status: 'scheduled', bankUTR: '', releasedAt: null, createdAt: d(0) },
];

export const MOCK_LOGISTICS = [
  { _id: 'log1', name: 'Delhivery', isActive: true, codAvailable: true, avgDeliveryDays: 3, serviceableStates: ['UP', 'MH', 'DL', 'RJ', 'KA', 'TS'], apiKey: '****KEY****' },
  { _id: 'log2', name: 'BlueDart', isActive: true, codAvailable: false, avgDeliveryDays: 2, serviceableStates: ['DL', 'MH', 'KA', 'TS', 'WB', 'TN'], apiKey: '****KEY****' },
  { _id: 'log3', name: 'DTDC', isActive: true, codAvailable: true, avgDeliveryDays: 4, serviceableStates: ['UP', 'MH', 'DL', 'RJ', 'MP', 'GJ'], apiKey: '****KEY****' },
  { _id: 'log4', name: 'Xpressbees', isActive: false, codAvailable: true, avgDeliveryDays: 5, serviceableStates: ['UP', 'MH'], apiKey: '' },
];

export const MOCK_CATEGORIES = [
  { _id: 'c1', name: 'Milk', slug: 'milk', icon: '🥛', isActive: true, parentCategory: null },
  { _id: 'c2', name: 'Ghee', slug: 'ghee', icon: '🫙', isActive: true, parentCategory: null },
  { _id: 'c3', name: 'Paneer', slug: 'paneer', icon: '🧀', isActive: true, parentCategory: null },
  { _id: 'c4', name: 'Cattle Feed', slug: 'cattle-feed', icon: '🌾', isActive: true, parentCategory: null },
  { _id: 'c5', name: 'Equipment', slug: 'equipment', icon: '🔧', isActive: true, parentCategory: null },
  { _id: 'c6', name: 'Poultry', slug: 'poultry', icon: '🐔', isActive: true, parentCategory: null },
  { _id: 'c7', name: 'Aquaculture', slug: 'aquaculture', icon: '🐟', isActive: false, parentCategory: null },
  { _id: 'c8', name: "Farmer's Produce", slug: 'farmers-produce', icon: '🌿', isActive: true, parentCategory: null },
];

export const MOCK_NOTIFICATIONS = [
  { _id: 'n1', type: 'seller_signup', title: 'New Seller Registration', message: 'Govardhan Organics (Deepak Yadav) has registered as a seller. Review KYC.', isRead: false, createdAt: d(0) + 'T08:00:00Z', relatedId: 's6' },
  { _id: 'n2', type: 'kyc_pending', title: 'KYC Pending Review', message: 'Sunrise Dairy (PSPK-S-00146) has submitted KYC documents for verification.', isRead: false, createdAt: d(0) + 'T09:00:00Z', relatedId: 's5' },
  { _id: 'n3', type: 'low_stock', title: 'Low Stock Alert', message: 'NutriCow Feed 5kg (PSPK-P-00002) has only 8 units remaining. Below threshold.', isRead: false, createdAt: d(0) + 'T10:30:00Z', relatedId: 'p2' },
  { _id: 'n4', type: 'payout_failed', title: 'Payout On Hold', message: 'Payment PAY-00004 for NutriCow Feeds is on hold pending order resolution.', isRead: true, createdAt: d(1) + 'T14:00:00Z', relatedId: 'pay4' },
  { _id: 'n5', type: 'order_delayed', title: 'RTO Alert', message: 'Order ORD-8825 (Rajan Dairy Farm) has been marked RTO after 3 failed delivery attempts.', isRead: true, createdAt: d(7) + 'T18:00:00Z', relatedId: 'o8' },
];

// Revenue chart data (last 30 days)
export const MOCK_REVENUE_CHART = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(today - (29 - i) * 86400000);
  return {
    date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Math.floor(8000 + Math.random() * 25000),
    orders: Math.floor(10 + Math.random() * 50),
  };
});

export const MOCK_DASHBOARD = {
  todayRevenue: 18420,
  todayRevenueChange: 12,
  grossSalesMonth: 548300,
  netRevenueMonth: 27415,
  activeOrders: 34,
  pendingOrders: 8,
  lowStockAlerts: 6,
  pendingSellerApprovals: 2,
  pendingPayouts: { count: 3, amount: 21163 },
  totalSellers: 3,
  totalOrders: 1284,
  revenueChart: MOCK_REVENUE_CHART,
  topSellers: [
    { sellerName: 'Mahesh Ghee House', sellerId: 'PSPK-S-00144', totalGross: 512300, orders: 2156, fulfillmentRate: 97 },
    { sellerName: 'Rajan Dairy Farm', sellerId: 'PSPK-S-00142', totalGross: 245800, orders: 1284, fulfillmentRate: 94 },
    { sellerName: 'NutriCow Feeds', sellerId: 'PSPK-S-00143', totalGross: 184500, orders: 892, fulfillmentRate: 88 },
    { sellerName: 'Paneer Palace', sellerId: 'PSPK-S-00145', totalGross: 78900, orders: 345, fulfillmentRate: 72 },
    { sellerName: 'Sunrise Dairy', sellerId: 'PSPK-S-00146', totalGross: 0, orders: 0, fulfillmentRate: 0 },
  ],
};
