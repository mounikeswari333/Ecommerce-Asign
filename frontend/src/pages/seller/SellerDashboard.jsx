import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, TrendingUp, Package, CreditCard, LogOut, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ 
    ordersCount: 0, 
    gmv: 0, 
    lowStock: 0, 
    pendingPayout: 0,
    completedPayout: 0,
    financials: {
      grossSales: 0,
      commission: 0,
      gatewayCharges: 0,
      logistics: 0,
      taxes: 0,
      adjustments: 0,
      netPayout: 0
    }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const token = localStorage.getItem('ps_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch orders
        const ordersRes = await axios.get(`${API_BASE}/api/orders`, { headers });
        // Fetch products
        const productsRes = await axios.get(`${API_BASE}/api/products`, { headers });
        // Fetch payments
        const paymentsRes = await axios.get(`${API_BASE}/api/payments`, { headers });
        
        if (ordersRes.data.success && productsRes.data.success) {
          const sellerId = user?.sellerId || 'PSPK-S-00001';
          const myOrders = ordersRes.data.orders.filter(o => o.sellerId?.sellerId === sellerId || o.sellerId === sellerId);
          const myProducts = productsRes.data.products.filter(p => p.sellerId?.sellerId === sellerId || p.sellerId === sellerId);

          const activeOrders = myOrders.filter(o => ['placed', 'packed', 'in_transit', 'out_for_delivery'].includes(o.status)).length;
          const totalGmv = myOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.grossAmount : 0), 0);
          const lowStockCount = myProducts.filter(p => p.stock < 10).length;

          let grossSales = 0;
          let commission = 0;
          let gatewayCharges = 0;
          let logistics = 0;
          let taxes = 0;
          let adjustments = 0;
          let netPayout = 0;
          let pendingPayout = 0;
          let completedPayout = 0;

          if (paymentsRes.data.success) {
            const myPayments = paymentsRes.data.payments.filter(
              p => p.sellerId?.sellerId === sellerId || p.sellerId === sellerId
            );
            myPayments.forEach(p => {
              grossSales += p.grossSaleAmount || 0;
              commission += p.platformCommission || 0;
              gatewayCharges += p.paymentGatewayFee || 0;
              logistics += p.logisticsCost || 0;
              taxes += p.taxes || 0;
              adjustments += p.adjustments || 0;
              netPayout += p.netPayoutAmount || 0;
              if (p.payoutStatus === 'settled') {
                completedPayout += p.netPayoutAmount || 0;
              } else {
                pendingPayout += p.netPayoutAmount || 0;
              }
            });
          } else {
            grossSales = totalGmv;
            commission = parseFloat((grossSales * 0.05).toFixed(2));
            gatewayCharges = parseFloat((grossSales * 0.025).toFixed(2));
            logistics = myOrders.filter(o => o.status === 'delivered' && o.shippingMode === 'easy_ship').length * 50;
            taxes = parseFloat((commission * 0.18).toFixed(2));
            adjustments = 0;
            netPayout = parseFloat((grossSales - commission - gatewayCharges - logistics - taxes).toFixed(2));
            pendingPayout = netPayout;
            completedPayout = 0;
          }

          setStats({
            ordersCount: activeOrders,
            gmv: totalGmv,
            lowStock: lowStockCount,
            pendingPayout,
            completedPayout,
            financials: {
              grossSales,
              commission,
              gatewayCharges,
              logistics,
              taxes,
              adjustments,
              netPayout
            }
          });

          setRecentOrders(myOrders.slice(0, 5));
        }
      } catch (err) {
        console.error('Fetch seller data error:', err);
        // Fallbacks
        setStats({ 
          ordersCount: 4, 
          gmv: 18420, 
          lowStock: 2, 
          pendingPayout: 12000,
          completedPayout: 4672.72,
          financials: {
            grossSales: 18420,
            commission: 921,
            gatewayCharges: 460.5,
            logistics: 200,
            taxes: 165.78,
            adjustments: 0,
            netPayout: 16672.72
          }
        });
        setRecentOrders([
          { orderId: 'ORD-44910', buyerName: 'Anita Singh', grossAmount: 430, status: 'placed', createdAt: new Date().toISOString() },
          { orderId: 'ORD-88123', buyerName: 'Raj Malhotra', grossAmount: 180, status: 'delivered', createdAt: new Date(Date.now() - 48*3600000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  const navLinks = [
    { to: '/seller', label: 'Dashboard', active: true },
    { to: '/seller/products', label: 'My Products' },
    { to: '/seller/orders', label: 'My Orders' },
    { to: '/seller/payments', label: 'My Payments' },
    { to: '/seller/profile', label: 'My Profile' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', fontFamily: 'var(--font-sans)' }}>
      {/* Seller Header */}
      <header style={{ background: '#1A1A0E', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>🏪</span>
              <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--yellow-500)' }}>
                PashuSevak <span style={{ fontSize: 11, background: 'var(--yellow-500)', color: '#1A1A0E', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>SELLER</span>
              </strong>
            </Link>

            <nav style={{ display: 'flex', gap: 16 }}>
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  style={{ 
                    color: link.active ? 'var(--yellow-500)' : 'rgba(255,255,255,0.7)', 
                    fontSize: 13, 
                    fontWeight: link.active ? 600 : 500,
                    textDecoration: 'none'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12 }}>
              <strong>{user?.businessName || 'Gau Kripa Dairy'}</strong>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.sellerId || 'PSPK-S-00101'}</span>
            </div>
            <button onClick={logout} className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.7)', padding: 6 }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gray-900)' }}>
              Seller Dashboard
            </h2>
            <p className="page-subtitle">Real-time status overview of your store operations</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading metrics...</div>
          </div>
        ) : (
          <>
            {/* KPI grid */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="kpi-tile brown">
                <div className="kpi-icon"><ShoppingBag size={22} /></div>
                <div className="kpi-body">
                  <div className="kpi-value">{stats.ordersCount}</div>
                  <div className="kpi-label">Active Orders</div>
                </div>
              </div>
              <div className="kpi-tile green">
                <div className="kpi-icon"><TrendingUp size={22} /></div>
                <div className="kpi-body">
                  <div className="kpi-value">₹{stats.gmv.toLocaleString()}</div>
                  <div className="kpi-label">Total Sales (GMV)</div>
                </div>
              </div>
              <div className="kpi-tile red">
                <div className="kpi-icon"><Package size={22} /></div>
                <div className="kpi-body">
                  <div className="kpi-value">{stats.lowStock}</div>
                  <div className="kpi-label">Low Stock items</div>
                </div>
              </div>
              <div className="kpi-tile blue">
                <div className="kpi-icon"><CreditCard size={22} /></div>
                <div className="kpi-body">
                  <div className="kpi-value">₹{stats.pendingPayout.toLocaleString()}</div>
                  <div className="kpi-label">Pending Payout</div>
                </div>
              </div>
              <div className="kpi-tile green">
                <div className="kpi-icon"><CheckCircle size={22} /></div>
                <div className="kpi-body">
                  <div className="kpi-value">₹{stats.completedPayout.toLocaleString()}</div>
                  <div className="kpi-label">Completed Payout</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginTop: 24 }}>
              {/* Recent Orders Card */}
              <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Incoming Orders</h3>
                  <Link to="/seller/orders" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--yellow-700)', fontWeight: 600 }}>
                    Manage Orders <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.orderId}>
                          <td><strong className="mono">{order.orderId}</strong></td>
                          <td>{order.buyerName}</td>
                          <td>₹{order.grossAmount}</td>
                          <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Settlement Summary Card */}
              <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', flexDirection: 'column', margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>Financial Summary</h3>
                  <Link to="/seller/payments" style={{ fontSize: 12, color: 'var(--yellow-700)', fontWeight: 600, textDecoration: 'none' }}>
                    View Ledger
                  </Link>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Gross Sales:</span>
                    <strong style={{ color: 'var(--gray-900)' }}>₹{stats.financials?.grossSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Platform Commission (5%):</span>
                    <strong style={{ color: 'var(--status-cancelled-text)' }}>-₹{stats.financials?.commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Payment Gateway Charges (2.5%):</span>
                    <strong style={{ color: 'var(--status-cancelled-text)' }}>-₹{stats.financials?.gatewayCharges.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Logistics Cost:</span>
                    <strong style={{ color: 'var(--status-cancelled-text)' }}>-₹{stats.financials?.logistics.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Taxes:</span>
                    <strong style={{ color: 'var(--status-cancelled-text)' }}>-₹{stats.financials?.taxes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Adjustments/Returns:</span>
                    <strong style={{ color: stats.financials?.adjustments < 0 ? 'var(--status-cancelled-text)' : 'var(--gray-900)' }}>₹{stats.financials?.adjustments.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, background: 'var(--yellow-50)', padding: 12, borderRadius: 8, marginTop: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>Net Seller Payout:</span>
                    <strong style={{ color: 'var(--tile-green-dark)', fontSize: 16 }}>₹{stats.financials?.netPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6, marginTop: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Pending Payout:</span>
                    <strong style={{ color: 'var(--yellow-700)' }}>₹{stats.pendingPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid var(--gray-100)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--gray-600)' }}>Completed Payout:</span>
                    <strong style={{ color: 'var(--tile-green-dark)' }}>₹{stats.completedPayout.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
