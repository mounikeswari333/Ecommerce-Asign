import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, LogOut, Info, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerPayments() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState(null);

  useEffect(() => {
    const fetchSellerPayments = async () => {
      try {
        const token = localStorage.getItem('ps_token');
        const res = await axios.get(`${API_BASE}/api/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const sellerId = user?.sellerId || 'PSPK-S-00001';
          const myPayments = res.data.payments.filter(
            p => p.sellerId?.sellerId === sellerId || p.sellerId === sellerId
          );
          setPayments(myPayments);
        }
      } catch (err) {
        console.error('Fetch seller payments error:', err);
        // Fallbacks
        setPayments([
          { paymentId: 'PAY-40912', orderId: { orderId: 'ORD-44910' }, grossSaleAmount: 430, platformCommission: 21.5, paymentGatewayFee: 10.75, logisticsCost: 50, taxes: 3.87, adjustments: 0, netPayoutAmount: 343.88, payoutStatus: 'pending' },
          { paymentId: 'PAY-88231', orderId: { orderId: 'ORD-88123' }, grossSaleAmount: 180, platformCommission: 9, paymentGatewayFee: 4.5, logisticsCost: 0, taxes: 1.62, adjustments: 0, netPayoutAmount: 164.88, payoutStatus: 'settled' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerPayments();
  }, [user]);

  const toggleExpand = (paymentId) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
  };

  const navLinks = [
    { to: '/seller', label: 'Dashboard' },
    { to: '/seller/products', label: 'My Products' },
    { to: '/seller/orders', label: 'My Orders' },
    { to: '/seller/payments', label: 'My Payments', active: true },
    { to: '/seller/profile', label: 'My Profile' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header style={{ background: '#1A1A0E', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
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

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gray-900)' }}>
            My Settlements Ledger
          </h2>
          <p className="page-subtitle">Track settlements and review detailed net payout breakdowns</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading payouts ledger...</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Payout formula block */}
            <div className="card" style={{ background: '#FFFDE7', border: '1.5px solid var(--yellow-400)', padding: 20, borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ background: 'var(--yellow-200)', width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                💡
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 14 }}>Settlement Formula:</strong>
                <span style={{ fontSize: 13, color: 'var(--gray-700)', display: 'block', marginTop: 4 }}>
                  Net Payout = Gross Sale Amount − Commission (5%) − Gateway Fee (2.5%) − Logistics Cost − Tax (18% GST on Commission) + Adjustments
                </span>
              </div>
            </div>

            {/* Payments list */}
            <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Gross Amount</th>
                      <th>Total Deductions</th>
                      <th>Net Payout</th>
                      <th>Status</th>
                      <th>Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(pay => {
                      const deductions = parseFloat(
                        (pay.platformCommission + pay.paymentGatewayFee + pay.logisticsCost + pay.taxes).toFixed(2)
                      );
                      const isExpanded = expandedPayment === pay.paymentId;

                      return (
                        <>
                          <tr key={pay.paymentId} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(pay.paymentId)}>
                            <td><span className="mono">{pay.paymentId}</span></td>
                            <td><span className="mono">{pay.orderId?.orderId || 'ORD-XYZ'}</span></td>
                            <td>₹{pay.grossSaleAmount}</td>
                            <td style={{ color: 'var(--status-cancelled-text)', fontWeight: 600 }}>-₹{deductions}</td>
                            <td style={{ color: 'var(--tile-green-dark)', fontWeight: 700 }}>₹{pay.netPayoutAmount}</td>
                            <td><span className={`status-badge ${pay.payoutStatus}`}>{pay.payoutStatus}</span></td>
                            <td>
                              <button className="btn btn-ghost" style={{ padding: 4 }}>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr style={{ background: 'var(--gray-50)' }}>
                              <td colSpan={7} style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, fontSize: 12 }}>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Gross Sale Amount:</span>
                                    <strong style={{ fontSize: 13, color: 'var(--gray-900)' }}>₹{pay.grossSaleAmount}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Platform Commission (5%):</span>
                                    <strong style={{ fontSize: 13, color: 'var(--status-cancelled-text)' }}>-₹{pay.platformCommission}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Gateway Fee (2.5%):</span>
                                    <strong style={{ fontSize: 13, color: 'var(--status-cancelled-text)' }}>-₹{pay.paymentGatewayFee}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Logistics Cost:</span>
                                    <strong style={{ fontSize: 13, color: 'var(--status-cancelled-text)' }}>-₹{pay.logisticsCost}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Taxes (18% on Comm):</span>
                                    <strong style={{ fontSize: 13, color: 'var(--status-cancelled-text)' }}>-₹{pay.taxes}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Adjustments:</span>
                                    <strong style={{ fontSize: 13 }}>₹{pay.adjustments}</strong>
                                  </div>
                                  <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: 16 }}>
                                    <span style={{ color: 'var(--gray-500)', display: 'block' }}>Net Payout Amount:</span>
                                    <strong style={{ fontSize: 15, color: 'var(--tile-green-dark)' }}>₹{pay.netPayoutAmount}</strong>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
