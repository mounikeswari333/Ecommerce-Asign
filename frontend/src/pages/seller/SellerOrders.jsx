import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Eye, LogOut, Check, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerOrders() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchSellerOrders = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.get(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const sellerId = user?.sellerId || 'PSPK-S-00001';
        // Filter orders belonging to this seller
        const myOrders = res.data.orders.filter(
          o => o.sellerId?.sellerId === sellerId || o.sellerId === sellerId
        );
        setOrders(myOrders);
      }
    } catch (err) {
      console.error('Fetch seller orders error:', err);
      // Fallback
      setOrders([
        { _id: 'o1', orderId: 'ORD-44910', buyerName: 'Anita Singh', buyerPhone: '9876543210', grossAmount: 430, status: 'placed', paymentMode: 'prepaid', paymentStatus: 'paid', timeline: [{ status: 'placed', timestamp: new Date().toISOString(), note: 'Order placed' }], items: [{ name: 'A2 Cow Ghee 500g', qty: 1, price: 430 }] },
        { _id: 'o2', orderId: 'ORD-88123', buyerName: 'Raj Malhotra', buyerPhone: '9812345678', grossAmount: 180, status: 'delivered', paymentMode: 'COD', paymentStatus: 'paid', timeline: [{ status: 'placed', timestamp: new Date(Date.now() - 48*3600000).toISOString() }, { status: 'delivered', timestamp: new Date(Date.now() - 1*3600000).toISOString(), note: 'Delivered' }], items: [{ name: 'Fresh Paneer 200g', qty: 2, price: 90 }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [user]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !statusUpdate) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.put(`${API_BASE}/api/orders/${selectedOrder._id}/status`, {
        status: statusUpdate,
        note: statusNote || `Status updated to ${statusUpdate} by seller`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(`Order status updated to ${statusUpdate}`);
        setSelectedOrder(res.data.order);
        // Refresh orders list
        fetchSellerOrders();
        setStatusNote('');
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => activeTab === 'all' || o.status === activeTab);

  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'placed', label: 'New Orders' },
    { key: 'packed', label: 'Packed' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const navLinks = [
    { to: '/seller', label: 'Dashboard' },
    { to: '/seller/products', label: 'My Products' },
    { to: '/seller/orders', label: 'My Orders', active: true },
    { to: '/seller/payments', label: 'My Payments' },
    { to: '/seller/profile', label: 'My Profile' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header style={{ background: '#1A1A0E', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
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
            My Orders
          </h2>
          <p className="page-subtitle">Track deliveries and process packing and dispatch status</p>
        </div>

        {/* Tab Pills */}
        <div className="tabs-row" style={{ marginBottom: 24, gap: 8 }}>
          {tabs.map(t => (
            <button 
              key={t.key} 
              className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
              style={{ padding: '8px 16px' }}
              onClick={() => { setActiveTab(t.key); setSelectedOrder(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading orders...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1.2fr 1fr' : '1fr', gap: 24, alignItems: 'flex-start' }}>
            {/* Orders list */}
            <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Items Count</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.orderId} style={{ cursor: 'pointer', background: selectedOrder?.orderId === order.orderId ? 'var(--yellow-50)' : '' }} onClick={() => { setSelectedOrder(order); setStatusUpdate(order.status); }}>
                        <td><span className="mono">{order.orderId}</span></td>
                        <td>{order.buyerName}</td>
                        <td>{order.items?.length || 1} item(s)</td>
                        <td>₹{order.grossAmount}</td>
                        <td><span className="status-badge draft">{order.paymentMode}</span></td>
                        <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                        <td>
                          <button className="btn btn-ghost" style={{ padding: 4 }}>
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Detail & Timeline Updater */}
            {selectedOrder && (
              <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>Order details: #{selectedOrder.orderId}</h3>
                  <div style={{ fontSize: 12, color: 'var(--gray-700)', marginTop: 4 }}>
                    <strong>Customer:</strong> {selectedOrder.buyerName} ({selectedOrder.buyerPhone})<br />
                    <strong>Delivery Address:</strong> {selectedOrder.deliveryAddress ? `${selectedOrder.deliveryAddress.line1}, ${selectedOrder.deliveryAddress.city}, ${selectedOrder.deliveryAddress.state} - ${selectedOrder.deliveryAddress.pincode}` : selectedOrder.buyerAddress || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11, marginTop: 8 }}>
                    <span style={{ background: selectedOrder.paymentStatus === 'paid' ? 'var(--yellow-100)' : 'var(--gray-100)', color: selectedOrder.paymentStatus === 'paid' ? 'var(--yellow-800)' : 'var(--gray-600)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                      Payment: {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                    {selectedOrder.razorpayPaymentId && (
                      <span style={{ background: 'var(--gray-100)', color: 'var(--gray-800)', padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                        TXN: {selectedOrder.razorpayPaymentId}
                      </span>
                    )}
                    {selectedOrder.netSellerAmount && (
                      <span style={{ background: 'var(--yellow-50)', color: 'var(--tile-green-dark)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                        Earnings: ₹{selectedOrder.netSellerAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    )}
                  </div>
                  {selectedOrder.paymentStatus === 'paid' && (
                    <a 
                      href={`${API_BASE}/api/payments/receipt/${selectedOrder.orderId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn"
                      style={{ 
                        textDecoration: 'none', 
                        textAlign: 'center', 
                        display: 'block',
                        background: 'var(--yellow-500)',
                        color: '#1A1A0E',
                        padding: '8px 12px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        marginTop: 10,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      📄 Download Receipt
                    </a>
                  )}
                </div>

                {/* Items List */}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
                  <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Items:</strong>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{item.name} <strong>x {item.qty}</strong></span>
                      <span>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--gray-100)', marginTop: 8, paddingTop: 8, fontSize: 14 }}>
                    <span>Gross Amount:</span>
                    <span>₹{selectedOrder.grossAmount}</span>
                  </div>
                </div>

                {/* Status Override */}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
                  <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Process Order Status:</strong>
                  
                  <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Update Status to:</label>
                      <select className="form-select" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} style={{ padding: '6px 12px' }}>
                        <option value="placed">Placed (New)</option>
                        <option value="packed">Packed</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out For Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Timeline Notes:</label>
                      <input className="form-input" value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="e.g. Handed over to Delhivery logistics" />
                    </div>

                    <button type="submit" disabled={updating} className="btn btn-primary" style={{ width: '100%', padding: 10, fontSize: 13 }}>
                      {updating ? 'Updating timeline...' : 'Apply Timeline Update'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
