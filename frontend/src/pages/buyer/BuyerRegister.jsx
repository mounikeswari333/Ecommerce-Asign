import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BuyerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Address details
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { registerBuyer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await registerBuyer({
      name,
      email,
      phone,
      password,
      address: {
        label: 'Home',
        line1,
        city,
        state,
        pincode,
        isDefault: true
      }
    });
    setLoading(false);

    if (res.success) {
      toast.success('Registration successful! Please login.');
      navigate('/buyer/login');
    } else {
      toast.error(res.message || 'Registration failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div className="card" style={{ background: '#fff', maxWidth: 450, width: '100%', padding: 32, borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>🐄</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginTop: 12, color: 'var(--gray-900)' }}>
            Buyer Registration
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 4 }}>
            Create a fresh customer account to order farm products
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              placeholder="e.g. Amit Kumar" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. buyer@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="form-label">Phone Number</label>
              <input 
                className="form-input" 
                placeholder="e.g. 9876543210" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="min 6 chars" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Delivery Address fields */}
          <h3 style={{ fontSize: 14, fontWeight: 700, borderBottom: '1px solid var(--gray-200)', paddingBottom: 6, marginTop: 8 }}>
            Default Delivery Address
          </h3>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Street Address</label>
            <input 
              className="form-input" 
              placeholder="Flat / House / Street Details" 
              value={line1}
              onChange={e => setLine1(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700, marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray-600)' }}>
          Already have a buyer account?{' '}
          <Link to="/buyer/login" style={{ color: 'var(--yellow-700)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
