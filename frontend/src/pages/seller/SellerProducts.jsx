import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package, Plus, LogOut, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SellerProducts() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Milk');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('litre');
  const [submitting, setSubmitting] = useState(false);

  const fetchSellerProducts = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const sellerId = user?.sellerId || 'PSPK-S-00001';
        // Filter products matching this seller
        const filtered = res.data.products.filter(
          p => p.sellerId?.sellerId === sellerId || p.sellerId === sellerId
        );
        setProducts(filtered);
      }
    } catch (err) {
      console.error('Fetch seller products error:', err);
      // Fallback
      setProducts([
        { productId: 'PSPK-P-00001', name: 'Fresh Buffalo Milk 1L', category: 'Milk', price: 65, mrp: 70, stock: 120, unit: 'litre', status: 'live' },
        { productId: 'PSPK-P-00002', name: 'Premium Cow Ghee 1L', category: 'Ghee', price: 620, mrp: 650, stock: 3, unit: 'pack', status: 'pending_approval' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [user]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error('Please fill in name, price, and stock quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/products', {
        name,
        category,
        description,
        price: parseFloat(price),
        mrp: parseFloat(mrp || price),
        stock: parseInt(stock),
        unit,
        sellerId: user?.id || 'direct-seller-id'
      });

      if (res.data.success) {
        toast.success('Product uploaded successfully! Awaiting Admin approval.');
        setShowAddModal(false);
        // Clear fields
        setName('');
        setDescription('');
        setPrice('');
        setMrp('');
        setStock('');
        // Refresh products list
        fetchSellerProducts();
      }
    } catch (err) {
      console.error('Add product error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload product.');
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = [
    { to: '/seller', label: 'Dashboard' },
    { to: '/seller/products', label: 'My Products', active: true },
    { to: '/seller/orders', label: 'My Orders' },
    { to: '/seller/payments', label: 'My Payments' },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gray-900)' }}>
              My Products
            </h2>
            <p className="page-subtitle">Add products and monitor catalog approval status</p>
          </div>
          
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading catalog...</div>
          </div>
        ) : (
          <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>MRP</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.productId}>
                      <td><span className="mono">{p.productId}</span></td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>₹{p.price}</td>
                      <td>₹{p.mrp}</td>
                      <td>
                        {p.stock < 10 ? (
                          <span style={{ color: 'var(--status-cancelled-text)', fontWeight: 700 }}>
                            {p.stock} (Low Stock)
                          </span>
                        ) : (
                          p.stock
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${p.status}`}>
                          {p.status === 'live' ? 'Live / Active' : p.status === 'pending_approval' ? 'Pending Approval' : p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal card" style={{ background: '#fff', padding: 24, maxWidth: 500, width: '100%', borderRadius: 12 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>Upload Farm Product</h3>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="form-label">Product Name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Organic Ghee 1L" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="form-label">Category</label>
                  <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Milk">Milk</option>
                    <option value="Ghee">Ghee</option>
                    <option value="Paneer">Paneer</option>
                    <option value="Cattle Feed">Cattle Feed</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="form-label">Unit type</label>
                  <select className="form-select" value={unit} onChange={e => setUnit(e.target.value)}>
                    <option value="litre">Litre (L)</option>
                    <option value="kg">Kilogram (Kg)</option>
                    <option value="pack">Pack</option>
                    <option value="unit">Single Unit</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="form-label">Selling Price</label>
                  <input type="number" className="form-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="₹" required />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="form-label">MRP</label>
                  <input type="number" className="form-input" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="₹" />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" value={stock} onChange={e => setStock(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="form-label">Product Description</label>
                <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe product freshness, organic process..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Uploading...' : 'Submit Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
