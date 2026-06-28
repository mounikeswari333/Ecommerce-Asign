import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BuyerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginBuyer } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await loginBuyer(email, password);
    setLoading(false);

    if (res.success) {
      toast.success('Logged in successfully!');
      navigate('/');
    } else {
      toast.error(res.message || 'Login failed. Try buyer@pashusevak.com / Buyer@123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--yellow-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card" style={{ background: '#fff', maxWidth: 400, width: '100%', padding: 32, borderRadius: 16, border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 40 }}>🐄</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, marginTop: 12, color: 'var(--gray-900)' }}>
            Buyer Sign In
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 4 }}>
            Access your cart, track orders, and view past purchases
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="e.g. customer@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700, marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray-600)' }}>
          Don't have a buyer account?{' '}
          <Link to="/buyer/register" style={{ color: 'var(--yellow-700)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>

        <div style={{ background: 'var(--yellow-100)', color: 'var(--yellow-700)', padding: 10, borderRadius: 8, fontSize: 11, textAlign: 'center', marginTop: 16, fontWeight: 500 }}>
          💡 Test Credentials:<br />
          <strong>buyer@pashusevak.com</strong> / <strong>Buyer@123</strong>
        </div>

      </div>
    </div>
  );
}
