import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@pashusevak.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🐄</div>
          <div className="auth-logo-text">
            <div className="brand">PashuSevak</div>
            <div className="sub">Admin Portal</div>
          </div>
        </div>

        <div className="auth-title">Welcome back 👋</div>
        <div className="auth-subtitle">Sign in to access the admin control center</div>

        {error && (
          <div className="alert-bar error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 38 }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@pashusevak.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--yellow-50)', borderRadius: 8, border: '1px solid var(--yellow-200)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yellow-700)', marginBottom: 6 }}>🔑 Demo Credentials</div>
          <div style={{ fontSize: 11, color: 'var(--gray-600)', lineHeight: 1.7 }}>
            <b>Super Admin:</b> admin@pashusevak.com / Admin@123<br />
            <b>Ops Admin:</b> ops@pashusevak.com / Admin@123<br />
            <b>Finance Admin:</b> finance@pashusevak.com / Admin@123
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--gray-500)' }}>
          Are you a seller?{' '}
          <Link to="/seller/register" style={{ color: 'var(--yellow-700)', fontWeight: 600 }}>
            Register as Seller →
          </Link>
        </div>
      </div>
    </div>
  );
}
