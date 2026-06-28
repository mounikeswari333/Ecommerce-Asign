import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Heart, Star, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/products/public/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error('Fetch product detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
    
    // Sync cart count
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
  }, [id]);

  const handleAddToCart = (redirect = false) => {
    if (!product) return;
    
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
      existing.qty += qty;
    } else {
      cart.push({
        productId: product._id,
        customProductId: product.productId,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        sellerId: product.sellerId?._id || product.sellerId,
        sellerName: product.sellerId?.businessName || product.sellerName || 'Direct Farm',
        qty,
      });
    }

    localStorage.setItem('ps_cart', JSON.stringify(cart));
    setCartCount(cart.reduce((sum, item) => sum + item.qty, 0));
    toast.success(`${product.name} added to cart!`);

    if (redirect) {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid var(--yellow-200)', borderTopColor: 'var(--yellow-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 500 }}>Loading product...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <h2>Product Not Found</h2>
        <Link to="/" className="btn btn-primary">Back to Store</Link>
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Storefront
          </button>
          <Link to="/cart" className="icon-btn" title="View Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1000, margin: '32px auto 0', padding: '0 24px' }}>
        <div className="card" style={{ background: '#fff', padding: 32, borderRadius: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 48, border: '1px solid var(--gray-200)' }}>
          
          {/* Image Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--gray-50)', height: 320, borderRadius: 12, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
              <img 
                src={product.images && product.images[0] ? product.images[0] : getCategoryFallbackImage(product.category)} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = getCategoryFallbackImage(product.category);
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {(product.images && product.images.length > 0 ? product.images : [getCategoryFallbackImage(product.category)]).map((imgUrl, index) => (
                <div key={index} style={{ border: '2px solid var(--gray-200)', background: 'var(--gray-50)', borderRadius: 8, display: 'flex', justifyContent: 'center', overflow: 'hidden', height: 60, cursor: 'pointer' }}>
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} thumbnail ${index}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = getCategoryFallbackImage(product.category);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details Side */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="status-badge live">{product.category}</span>
                {discount > 0 && (
                  <span className="status-badge cancelled" style={{ fontSize: 10, fontWeight: 700 }}>
                    {discount}% OFF
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--gray-900)', marginTop: 12 }}>
                {product.name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={16} fill="#F5C518" stroke="none" />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>4.8</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>(42 customer reviews)</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--gray-300)', height: 16 }} />
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                  Seller: <strong>{product.sellerName || 'Direct Farm'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 24 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-900)' }}>
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <span style={{ fontSize: 18, textDecoration: 'line-through', color: 'var(--gray-400)' }}>
                    ₹{product.mrp}
                  </span>
                )}
                <span style={{ fontSize: 13, color: 'var(--gray-500)', marginLeft: 8 }}>
                  per {product.unit || 'unit'}
                </span>
              </div>

              {/* Stock status */}
              <div style={{ marginTop: 16 }}>
                {product.stock > 10 ? (
                  <span className="status-badge active">✓ In Stock ({product.stock} units available)</span>
                ) : product.stock > 0 ? (
                  <span className="status-badge pending">⚠️ Low Stock! Only {product.stock} left</span>
                ) : (
                  <span className="status-badge suspended">❌ Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <p style={{ color: 'var(--gray-700)', fontSize: 14, lineHeight: 1.6, marginTop: 24 }}>
                {product.description || 'This premium dairy farm product is produced locally in clean, controlled environments. Rich in natural nutrients and delivered fresh daily to ensure maximum quality and pure taste.'}
              </p>
            </div>

            {/* Actions Panel */}
            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 24, marginTop: 32 }}>
              {product.stock > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Qty Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-300)', borderRadius: 8, background: 'var(--gray-50)' }}>
                      <button 
                        onClick={() => setQty(prev => Math.max(1, prev - 1))}
                        style={{ background: 'none', border: 'none', padding: 8, display: 'flex', alignItems: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{qty}</span>
                      <button 
                        onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                        style={{ background: 'none', border: 'none', padding: 8, display: 'flex', alignItems: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Add / Buy Buttons */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button 
                      onClick={() => handleAddToCart(false)}
                      className="btn btn-outline" 
                      style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 600 }}
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => handleAddToCart(true)}
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 600 }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-outline" disabled style={{ width: '100%', padding: 12 }}>
                  Out of Stock
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 12, marginTop: 16, justifyContent: 'center' }}>
                <ShieldCheck size={14} />
                <span>PashuSevak 100% Quality & Safety Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
