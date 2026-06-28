import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

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
    setCartItems(cart);
  }, []);

  const updateQty = (id, newQty) => {
    const updated = cartItems.map(item => 
      item.productId === id ? { ...item, qty: Math.max(1, newQty) } : item
    );
    setCartItems(updated);
    localStorage.setItem('ps_cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.productId !== id);
    setCartItems(updated);
    localStorage.setItem('ps_cart', JSON.stringify(updated));
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 500 ? 0 : subtotal > 0 ? 50 : 0;
  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST on milk/dairy
  const total = subtotal + deliveryFee + tax;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Store
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1000, margin: '32px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 24, color: 'var(--gray-900)' }}>
          Shopping Cart
        </h2>

        {cartItems.length === 0 ? (
          <div className="card" style={{ background: '#fff', padding: '64px 32px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
            <ShoppingBag size={64} style={{ opacity: 0.3, margin: '0 auto' }} />
            <h3 style={{ fontWeight: 700, marginTop: 16 }}>Your cart is empty</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 4 }}>Add dairy items to your cart to checkout.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>
              Shop Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'flex-start' }}>
            
            {/* Items Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map(item => (
                <div key={item.productId} className="card" style={{ background: '#fff', padding: 20, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid var(--gray-200)', borderRadius: 12 }}>
                  <div style={{ background: 'var(--gray-100)', width: 64, height: 64, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                    🥛
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.productId}`} style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                      {item.name}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Seller: {item.sellerName}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginTop: 8 }}>₹{item.price}</div>
                  </div>
                  
                  {/* Quantity and Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-300)', borderRadius: 8 }}>
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} style={{ background: 'none', border: 'none', padding: 6, display: 'flex', alignItems: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} style={{ background: 'none', border: 'none', padding: 6, display: 'flex', alignItems: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button onClick={() => removeItem(item.productId)} className="btn btn-ghost" style={{ color: 'var(--status-cancelled-text)', padding: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Column */}
            <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--gray-700)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <strong>₹{subtotal}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: 'var(--tile-green-dark)', fontWeight: 600 }}>FREE</span>
                  ) : (
                    <strong>₹{deliveryFee}</strong>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxes (5% GST)</span>
                  <strong>₹{tax}</strong>
                </div>
                
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'var(--gray-900)' }}>
                  <span>Total</span>
                  <strong style={{ color: 'var(--yellow-700)' }}>₹{total}</strong>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 24, padding: 12, fontSize: 14, fontWeight: 700 }}
              >
                Proceed to Checkout
              </button>
              
              {deliveryFee > 0 && (
                <div style={{ background: 'var(--yellow-100)', color: 'var(--yellow-700)', padding: 8, borderRadius: 8, fontSize: 11, textAlign: 'center', marginTop: 12, fontWeight: 600 }}>
                  Add ₹{500 - subtotal} more for FREE delivery!
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
