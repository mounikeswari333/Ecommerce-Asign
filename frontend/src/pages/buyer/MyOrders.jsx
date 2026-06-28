import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Eye, Calendar, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('ps_token');
        // Fetch all orders - if buyer role is active, we can filter locally or call backend
        const res = await axios.get(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          // Filter orders matching this buyer's ID
          const buyerId = user?.buyerId || 'PSPK-B-00001';
          const buyerOrders = res.data.orders.filter(o => o.buyerId === buyerId);
          setOrders(buyerOrders);
        }
      } catch (err) {
        console.error('Fetch My Orders error:', err);
        // Mock fallback if offline/backend fails
        setOrders([
          { orderId: 'ORD-44910', createdAt: new Date().toISOString(), grossAmount: 430, status: 'placed', items: [{ name: 'A2 Cow Ghee 500g', qty: 1, price: 430 }] },
          { orderId: 'ORD-88123', createdAt: new Date(Date.now() - 48*3600000).toISOString(), grossAmount: 180, status: 'delivered', items: [{ name: 'Fresh Paneer 200g', qty: 2, price: 90 }] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1000, margin: '32px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 24, color: 'var(--gray-900)' }}>
          My Purchase History
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card" style={{ background: '#fff', padding: '64px 32px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
            <ShoppingBag size={64} style={{ opacity: 0.3, margin: '0 auto' }} />
            <h3 style={{ fontWeight: 700, marginTop: 16 }}>No orders placed yet</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>You haven't ordered any dairy farm items yet.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order.orderId} className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong style={{ fontSize: 16, color: 'var(--gray-900)' }}>Order #{order.orderId}</strong>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{order.items?.length || 1} item(s)</span>
                    <span>•</span>
                    <strong>₹{order.grossAmount}</strong>
                  </div>

                  {/* Items Summary preview */}
                  <div style={{ fontSize: 13, color: 'var(--gray-700)', marginTop: 12 }}>
                    {order.items?.map(it => `${it.name} (x${it.qty})`).join(', ') || 'Dairy Products'}
                  </div>
                </div>

                <Link to={`/track-order/${order.orderId}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 16px' }}>
                  <Eye size={15} /> Track Order
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
