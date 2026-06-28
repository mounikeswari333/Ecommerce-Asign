import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Package, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getCategoryFallbackImage = (category) => {
  const fallbacks = {
    'Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
    'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=600',
    'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
    'Cattle Feed': 'https://images.unsplash.com/photo-1595273670150-db0a3e368167?auto=format&fit=crop&q=80&w=600',
    'Equipment': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
  };
  return fallbacks[category] || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600';
};

export default function Storefront() {
  const navigate = useNavigate();
  const { admin: user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('popular');
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (product) => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    let cart = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('ps_cart'));
      if (Array.isArray(parsed)) {
        cart = parsed;
      }
    } catch (e) {
      cart = [];
    }

    const existing = (cart || []).find(item => item?.productId === product._id);

    if (existing) {
      if (existing.qty >= product.stock) {
        toast.error(`Cannot add more. Only ${product.stock} units in stock.`);
        return;
      }
      existing.qty += 1;
    } else {
      cart.push({
        productId: product._id,
        customProductId: product.productId,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        sellerId: product.sellerId?._id || product.sellerId,
        sellerName: product.sellerId?.businessName || product.sellerName || 'Direct Farm',
        qty: 1,
      });
    }

    localStorage.setItem('ps_cart', JSON.stringify(cart));
    setCartCount((cart || []).reduce((sum, item) => sum + (item?.qty || 0), 0));
    toast.success(`${product.name} added to cart!`);
  };

  useEffect(() => {
    let cart = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('ps_cart'));
      if (Array.isArray(parsed)) {
        cart = parsed;
      }
    } catch (e) {
      cart = [];
    }
    setCartCount((cart || []).reduce((sum, item) => sum + (item?.qty || 0), 0));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/products/public?category=${activeCategory}&search=${search}`);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Fetch storefront products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, search]);

  const filteredProducts = [...products].sort((a, b) => {
    if (sortOrder === 'price-low') return a.price - b.price;
    if (sortOrder === 'price-high') return b.price - a.price;
    return b.stock - a.stock;
  });

  const categories = ['All', 'Milk', 'Ghee', 'Paneer', 'Cattle Feed', 'Equipment'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', fontFamily: 'var(--font-sans)' }}>
      {/* Store Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28 }}>🐄</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--gray-900)' }}>
              PashuSevak <span style={{ color: 'var(--yellow-600)', fontSize: 13, fontWeight: 700 }}>STORE</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="topbar-search" style={{ flex: 1, maxWidth: 500 }}>
            <Search size={16} />
            <input 
              placeholder="Search fresh milk, organic ghee, paneer, cattle feeds..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Navigation controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/cart" className="icon-btn" title="View Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>

            {user && user.role === 'buyer' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/my-orders" className="btn btn-outline" style={{ fontSize: 13, padding: '6px 12px' }}>
                  My Orders
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: 12 }}>
                  <strong>{user.name}</strong>
                  <span style={{ color: 'var(--gray-500)' }}>{user.buyerId}</span>
                </div>
                <button onClick={logout} className="btn btn-ghost" title="Logout" style={{ padding: 6 }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/buyer/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Login</Link>
                <Link to="/buyer/register" className="btn btn-primary" style={{ fontSize: 13, padding: '6px 16px' }}>Sign Up</Link>
              </div>
            )}
            
            {/* Quick Portal Switch */}
            <div style={{ borderLeft: '1px solid var(--gray-200)', paddingLeft: 12 }}>
              <Link to="/seller/login" style={{ fontSize: 12, color: 'var(--yellow-700)', fontWeight: 600 }}>
                Seller Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ 
        background: 'linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%)', 
        borderBottom: '1px solid var(--yellow-200)', 
        padding: '48px 24px', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <span style={{ fontSize: 48 }}>🥛</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, color: 'var(--gray-900)', marginTop: 12 }}>
            Fresh Dairy & Farm Care Products
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: 16, marginTop: 8, maxWidth: 600, margin: '8px auto 24px' }}>
            Directly from certified local dairy farms to your doorstep. Pure, organic, and locally-sourced ghee, cheese, milk, and feeds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`tab-pill ${activeCategory === cat ? 'active' : ''}`}
                style={{ padding: '8px 16px', borderRadius: 20 }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18, color: 'var(--gray-900)' }}>
            Showing {filteredProducts.length} items
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Sort by:</span>
            <select 
              className="form-select" 
              value={sortOrder} 
              onChange={e => setSortOrder(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 13, width: 140 }}
            >
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--yellow-200)', borderTopColor: 'var(--yellow-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', background: '#fff' }}>
            <span style={{ fontSize: 48 }}>🌾</span>
            <h4 style={{ fontWeight: 700, marginTop: 12 }}>No Products Found</h4>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Try adjusting your keywords or category filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {filteredProducts.map(p => {
              const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              const sellerName = p.sellerId?.businessName || p.sellerName || 'Direct Farm';
              return (
                <div key={p._id} className="card" style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
                  <div style={{ background: 'var(--gray-50)', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    {discount > 0 && (
                      <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--tile-red-bg)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, zIndex: 10 }}>
                        {discount}% OFF
                      </span>
                    )}
                    <img 
                      src={p.images && p.images[0] ? p.images[0] : getCategoryFallbackImage(p.category)} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onError={(e) => {
                        e.target.src = getCategoryFallbackImage(p.category);
                      }}
                    />
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span className="status-badge draft" style={{ fontSize: 10, padding: '2px 6px', alignSelf: 'flex-start' }}>
                      {p.category}
                    </span>
                    <Link to={`/product/${p._id}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginTop: 8, display: 'block' }}>
                      {p.name}
                    </Link>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                      By {sellerName}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                      <Star size={14} fill="#F5C518" stroke="none" />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>4.8</span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>(42 reviews)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)' }}>
                        ₹{p.price}
                      </span>
                      {p.mrp > p.price && (
                        <span style={{ fontSize: 13, textDecoration: 'line-through', color: 'var(--gray-400)' }}>
                          ₹{p.mrp}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--gray-500)', marginLeft: 'auto' }}>
                        per {p.unit || 'unit'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <button 
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="btn btn-outline" 
                        style={{ flex: 1, gap: 4, padding: '8px 12px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleAddToCart(p)}
                        className="btn btn-primary" 
                        style={{ flex: 1.5, gap: 4, padding: '8px 12px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ShoppingCart size={13} /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
