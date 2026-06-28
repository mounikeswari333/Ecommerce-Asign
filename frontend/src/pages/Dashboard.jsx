import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { MOCK_DASHBOARD, MOCK_ORDERS, MOCK_SELLERS } from '../data/mockData';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package, Users,
  AlertTriangle, IndianRupee, Clock, Eye, RefreshCw, ArrowRight
} from 'lucide-react';

const fmt = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${n}`;

function KpiTile({ color, icon, value, label, sub, subAlert, onClick }) {
  return (
    <div className={`kpi-tile ${color}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="kpi-tile-icon">{icon}</div>
      <div>
        <div className="kpi-tile-value">{value}</div>
        <div className="kpi-tile-label">{label}</div>
        {sub && <div className={`kpi-tile-sub ${subAlert ? 'alert' : ''}`}>{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: 'var(--gray-600)' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            {p.name === 'revenue' ? `₹${p.value.toLocaleString('en-IN')}` : `${p.value} orders`}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState(MOCK_DASHBOARD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('ps_token');
        const res = await axios.get(`${API_BASE}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const d = dashboardData;
  const chartData = (d.revenueChart || []).slice(-30);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statusCounts = MOCK_ORDERS.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{getGreeting()}, {admin?.name?.split(' ')[0]} 🌾</div>
          <div className="page-subtitle">Here's your platform summary for today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="page-actions">
          <div className="tab-group">
            {['today','week','month'].map(p => (
              <button key={p} className={`tab-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-outline btn-sm"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* KPI Grid — matching screenshot tiles */}
      <div className="kpi-grid">
        <KpiTile color="green" icon="💰" value={fmt(d.todayRevenue)} label="Today's Revenue" sub={`↑ ${d.todayRevenueChange}% from yesterday`} onClick={() => navigate('/payments')} />
        <KpiTile color="brown" icon="📦" value={d.activeOrders} label="Active Orders" sub={`${d.pendingOrders} need action`} subAlert onClick={() => navigate('/orders')} />
        <KpiTile color="green" icon="🛒" value={d.totalOrders.toLocaleString('en-IN')} label="Total Orders" sub="↑ 5% this month" onClick={() => navigate('/orders')} />
        <KpiTile color="red" icon="⚠️" value={d.lowStockAlerts} label="Low Stock Items" sub="Restock needed" subAlert onClick={() => navigate('/products')} />
        <KpiTile color="amber" icon="🏪" value={d.pendingSellerApprovals} label="Pending Approvals" sub="New seller KYC review" subAlert onClick={() => navigate('/sellers')} />
        <KpiTile color="blue" icon="💸" value={`₹${(d.pendingPayouts.amount/1000).toFixed(1)}K`} label="Pending Payouts" sub={`${d.pendingPayouts.count} batches awaiting release`} onClick={() => navigate('/payments')} />
        <KpiTile color="green" icon="👥" value={d.totalSellers} label="Active Sellers" sub="Platform-wide" onClick={() => navigate('/sellers')} />
        <KpiTile color="purple" icon="📈" value={fmt(d.netRevenueMonth)} label="Net Revenue (Month)" sub="Platform commission earned" onClick={() => navigate('/reports')} />
      </div>

      {/* Platform Financial Operations (Requirement 8) */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--gray-900)', marginTop: 24, marginBottom: 12 }}>
          Platform Financial Operations (Lifetime)
        </h3>
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <KpiTile color="green" icon="💰" value={`₹${(d.totalRevenue || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`} label="Total Gross Revenue" sub="Total paid order volume" />
          <KpiTile color="purple" icon="📈" value={`₹${(d.totalCommission || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`} label="Platform Commission (5%)" sub="Commission earnings" />
          <KpiTile color="amber" icon="💳" value={`₹${(d.totalGatewayFee || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`} label="Gateway Charges (2.5%)" sub="Razorpay gateway fees" />
          <KpiTile color="blue" icon="💸" value={`₹${(d.totalSellerPayout || 0).toLocaleString('en-IN', {maximumFractionDigits: 2})}`} label="Net Seller Payouts" sub="Earnings share to sellers" />
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        {/* Revenue Trend */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={16} color="var(--yellow-600)" /> Revenue Trend — Last 30 Days</div>
            <div className="card-actions">
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Gross Sales</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--gray-500)' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--gray-500)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="#F5C518" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#E8B800' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><ShoppingCart size={16} color="var(--yellow-600)" /> Order Status</div>
          </div>
          <div className="card-body">
            {[
              { label: 'Delivered', count: statusCounts.delivered || 0, color: '#2E7D32' },
              { label: 'In Transit', count: statusCounts.in_transit || 0, color: '#E65100' },
              { label: 'Out for Delivery', count: statusCounts.out_for_delivery || 0, color: '#F57F17' },
              { label: 'Placed', count: statusCounts.placed || 0, color: '#1565C0' },
              { label: 'Packed', count: statusCounts.packed || 0, color: '#4527A0' },
              { label: 'Cancelled', count: statusCounts.cancelled || 0, color: '#B71C1C' },
              { label: 'RTO', count: statusCounts.rto || 0, color: '#880E4F' },
            ].map(s => {
              const total = MOCK_ORDERS.length;
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Sellers + Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Sellers */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Top Sellers by GMV</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sellers')}>View All <ArrowRight size={14} /></button>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Seller</th>
                  <th>GMV</th>
                  <th>Orders</th>
                  <th>Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {d.topSellers.filter(s => s.totalGross > 0).map((s, i) => (
                  <tr key={s.sellerId} style={{ cursor: 'pointer' }} onClick={() => navigate('/sellers')}>
                    <td style={{ fontWeight: 700, color: i === 0 ? '#F5C518' : i === 1 ? '#9E9E9E' : i === 2 ? '#CD7F32' : 'var(--gray-500)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.sellerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{s.sellerId}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2E7D32' }}>₹{s.totalGross.toLocaleString('en-IN')}</td>
                    <td>{s.orders}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.fulfillmentRate >= 90 ? '#2E7D32' : s.fulfillmentRate >= 75 ? '#E65100' : '#B71C1C' }}>
                        {s.fulfillmentRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🕐 Recent Orders</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')}>View All <ArrowRight size={14} /></button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(d.recentOrders || []).slice(0, 6).map(order => (
              <div
                key={order._id}
                style={{ padding: '10px 20px', borderBottom: '1px solid var(--gray-50)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--yellow-50)'}
                onMouseOut={e => e.currentTarget.style.background = ''}
                onClick={() => navigate('/orders')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{order.orderId}</span>
                  <span className={`status-badge ${order.status.replace('_', '-')}`}>{order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-500)' }}>
                  <span>{order.sellerId?.businessName || order.sellerName || 'Direct'} • {order.buyerName}</span>
                  <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>₹{order.grossAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title"><AlertTriangle size={16} color="#E65100" /> Action Required</div>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
          {[
            { icon: '🏪', title: '2 Seller Applications', desc: 'Sunrise Dairy & Govardhan Organics awaiting KYC review', color: 'amber', action: () => navigate('/sellers') },
            { icon: '📦', title: '2 Products Pending Approval', desc: 'Hard Paneer 500g & Silage Wrapper Pro in review queue', color: 'amber', action: () => navigate('/products') },
            { icon: '⚠️', title: '6 Low Stock Items', desc: 'NutriCow Feed 5kg (8 units), Fresh Paneer (5 units)...', color: 'error', action: () => navigate('/products') },
            { icon: '💸', title: '3 Payouts Pending', desc: '₹21,163 pending across 3 sellers awaiting batch release', color: 'info', action: () => navigate('/payments') },
          ].map((alert, i) => (
            <div key={i} className={`alert-bar ${alert.color}`} style={{ cursor: 'pointer' }} onClick={alert.action}>
              <span style={{ fontSize: 18 }}>{alert.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{alert.title}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{alert.desc}</div>
              </div>
              <ArrowRight size={14} style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
