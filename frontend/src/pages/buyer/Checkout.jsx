import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  
  // Address State
  const [line1, setLine1] = useState(user?.addresses?.[0]?.line1 || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '');

  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(false);

  // Dynamic Shipping Integration States
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState('');
  const [shippingCost, setShippingCost] = useState(50);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

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
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [navigate]);

  // Fetch Shipping Options based on Pincode
  useEffect(() => {
    if (pincode && pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      const fetchShippingOptions = async () => {
        try {
          const sellerId = cartItems[0]?.sellerId || 'direct-seller';
          const token = localStorage.getItem('ps_token');
          const res = await axios.post('http://localhost:5000/api/logistics/calculate-shipping', {
            pincode,
            sellerId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success && res.data.options.length) {
            setShippingOptions(res.data.options);
            const first = res.data.options[0];
            setSelectedCourier(first.courierPartner);
            setShippingCost(first.shippingCost);
            setEstimatedDelivery(first.estimatedDelivery);
          } else {
            setShippingOptions([]);
            setShippingCost(50);
            setEstimatedDelivery('');
          }
        } catch (err) {
          console.error('Error fetching shipping rates:', err);
          setShippingOptions([]);
        }
      };
      fetchShippingOptions();
    }
  }, [pincode, cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = shippingCost;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

  // Dynamically load Razorpay checkout script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !line1 || !city || !state || !pincode) {
      toast.error('Please complete all delivery details');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('ps_token');

    if (paymentMode === 'COD') {
      const orderData = {
        sellerId: (cartItems || [])[0]?.sellerId || 'direct-seller',
        buyerId: user?.buyerId || 'PSPK-B-00001',
        buyerName,
        buyerPhone,
        deliveryAddress: { line1, city, state, pincode },
        items: (cartItems || []).map(item => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        grossAmount: total,
        paymentMode,
        courierPartner: selectedCourier || 'DTDC',
        shippingCost,
        estimatedDelivery
      };

      try {
        const orderRes = await axios.post('http://localhost:5000/api/orders', orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!orderRes.data.success) {
          throw new Error(orderRes.data.message || 'Order creation failed');
        }

        const createdOrder = orderRes.data.order;
        const orderId = createdOrder.orderId;

        localStorage.removeItem('ps_cart');
        toast.success('Order placed successfully (Cash on Delivery)!');
        navigate(`/order-confirmation/${orderId}`);
      } catch (err) {
        console.error('Checkout placing error:', err);
        toast.error(err.response?.data?.message || err.message || 'Checkout failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Prepaid checkout via Razorpay (Unified checkout endpoint)
      try {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          toast.error('Failed to load Razorpay payment gateway. Try again.');
          setLoading(false);
          return;
        }

        // Idempotency check: unique reference for this checkout session
        const idempotencyKey = `ps-chk-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

        const checkoutData = {
          items: (cartItems || []).map(item => ({
            productId: item.productId,
            qty: item.qty
          })),
          buyerName,
          buyerPhone,
          deliveryAddress: { line1, city, state, pincode },
          paymentMode: 'prepaid',
          courierPartner: selectedCourier || 'DTDC',
          shippingCost,
          estimatedDelivery,
          idempotencyKey,
          buyerId: user?.buyerId
        };

        const checkoutRes = await axios.post('http://localhost:5000/api/payments/checkout', checkoutData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!checkoutRes.data.success) {
          throw new Error(checkoutRes.data.message || 'Checkout registration failed');
        }

        const { razorpayOrderId, orderId, amount, currency, key } = checkoutRes.data;

        const options = {
          key: key || 'rzp_test_5173kKeyIdMock',
          amount: Math.round(amount * 100),
          currency: currency || 'INR',
          name: 'PashuSevak Store',
          description: `Payment for Order #${orderId}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyRes = await axios.post('http://localhost:5000/api/payments/verify', {
                orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                items: (cartItems || []).map(item => ({
                  productId: item.productId,
                  qty: item.qty
                })),
                buyerName,
                buyerPhone,
                deliveryAddress: { line1, city, state, pincode },
                paymentMode: 'prepaid',
                courierPartner: selectedCourier || 'DTDC',
                shippingCost,
                estimatedDelivery,
                buyerId: user?.buyerId
              });

              if (verifyRes.data.success) {
                localStorage.removeItem('ps_cart');
                toast.success('Prepaid Payment Verified & Order Confirmed!');
                navigate(`/order-confirmation/${orderId}`);
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (err) {
              console.error('Verify error:', err);
              toast.error(err.response?.data?.message || 'Verification endpoint error');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: buyerName,
            contact: buyerPhone,
            email: user?.email || 'buyer@pashusevak.com'
          },
          theme: {
            color: '#E8B800'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setLoading(false);
      } catch (err) {
        console.error('Checkout placing error:', err);
        toast.error(err.response?.data?.message || err.message || 'Checkout failed');
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/cart')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Cart
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1000, margin: '32px auto 0', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 24, color: 'var(--gray-900)' }}>
          Checkout Details
        </h2>

        <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          
          {/* Billing / Address Form */}
          <div className="card" style={{ background: '#fff', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
              Delivery Information
            </h3>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="form-label">Full Name</label>
              <input 
                className="form-input" 
                value={buyerName} 
                onChange={e => setBuyerName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="form-label">Phone Number</label>
              <input 
                className="form-input" 
                value={buyerPhone} 
                onChange={e => setBuyerPhone(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="form-label">Street Address</label>
              <input 
                className="form-input" 
                value={line1} 
                onChange={e => setLine1(e.target.value)} 
                placeholder="Flat / House No. / Area" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">State</label>
                <input className="form-input" value={state} onChange={e => setState(e.target.value)} required />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">Pincode</label>
                <input className="form-input" value={pincode} onChange={e => setPincode(e.target.value)} required />
              </div>
            </div>

            {/* Courier Selection */}
            {shippingOptions.length > 0 && (
              <>
                <h3 style={{ fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginTop: 16 }}>
                  Select Delivery Courier
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {shippingOptions.map(option => (
                    <label 
                      key={option.courierPartner}
                      style={{ 
                        border: `2px solid ${selectedCourier === option.courierPartner ? 'var(--yellow-500)' : 'var(--gray-200)'}`,
                        background: selectedCourier === option.courierPartner ? 'var(--yellow-50)' : '#fff',
                        borderRadius: 10, 
                        padding: '12px 16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input 
                          type="radio" 
                          name="courier" 
                          checked={selectedCourier === option.courierPartner} 
                          onChange={() => {
                            setSelectedCourier(option.courierPartner);
                            setShippingCost(option.shippingCost);
                            setEstimatedDelivery(option.estimatedDelivery);
                          }}
                        />
                        <div>
                          <strong style={{ display: 'block', fontSize: 14 }}>{option.courierPartner}</strong>
                          <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Est. Delivery: {option.estimatedDelivery}</span>
                        </div>
                      </div>
                      <strong style={{ color: 'var(--gray-800)' }}>₹{option.shippingCost}</strong>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Payment Method Option */}
            <h3 style={{ fontWeight: 700, fontSize: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8, marginTop: 16 }}>
              Select Payment Method
            </h3>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <label 
                style={{ 
                  flex: 1, 
                  border: `2px solid ${paymentMode === 'COD' ? 'var(--yellow-500)' : 'var(--gray-200)'}`,
                  background: paymentMode === 'COD' ? 'var(--yellow-50)' : '#fff',
                  borderRadius: 10, 
                  padding: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  cursor: 'pointer' 
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMode === 'COD'} 
                  onChange={() => setPaymentMode('COD')}
                />
                <div>
                  <strong style={{ display: 'block', fontSize: 14 }}>Cash on Delivery</strong>
                  <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Pay cash when delivered</span>
                </div>
              </label>
              
              <label 
                style={{ 
                  flex: 1, 
                  border: `2px solid ${paymentMode === 'prepaid' ? 'var(--yellow-500)' : 'var(--gray-200)'}`,
                  background: paymentMode === 'prepaid' ? 'var(--yellow-50)' : '#fff',
                  borderRadius: 10, 
                  padding: 16, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  cursor: 'pointer' 
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMode === 'prepaid'} 
                  onChange={() => setPaymentMode('prepaid')}
                />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <CreditCard size={20} />
                  <div>
                    <strong style={{ display: 'block', fontSize: 14 }}>Online Payment</strong>
                    <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>Pay securely via Razorpay</span>
                  </div>
                </div>
              </label>
            </div>

          </div>

          {/* Cart Recap & Total */}
          <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
              Order Review
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 180, overflowY: 'auto', marginBottom: 16 }}>
              {(cartItems || []).map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--gray-700)' }}>
                    {item.name} <strong style={{ color: 'var(--gray-900)' }}>x {item.qty}</strong>
                  </span>
                  <strong>₹{item.price * item.qty}</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, borderTop: '1px solid var(--gray-100)', paddingTop: 16, color: 'var(--gray-700)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxes (5% GST)</span>
                <span>₹{tax}</span>
              </div>
              
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'var(--gray-900)' }}>
                <span>Order Total</span>
                <strong style={{ color: 'var(--yellow-700)' }}>₹{total}</strong>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: 24, padding: 12, fontSize: 14, fontWeight: 700 }}
            >
              {loading ? 'Processing Checkout...' : paymentMode === 'COD' ? 'Place COD Order' : 'Pay via Razorpay'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 11, marginTop: 16, justifyContent: 'center' }}>
              <ShieldCheck size={14} />
              <span>Safe and Encrypted Checkout Process</span>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
