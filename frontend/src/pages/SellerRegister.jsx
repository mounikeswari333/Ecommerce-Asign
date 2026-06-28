import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, ArrowLeft, Store } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  { name: 'Milk', icon: '🥛' }, { name: 'Ghee', icon: '🫙' }, { name: 'Paneer', icon: '🧀' },
  { name: 'Cattle Feed', icon: '🌾' }, { name: 'Equipment', icon: '🔧' }, { name: 'Poultry', icon: '🐔' },
  { name: 'Pets & Companions', icon: '🐾' }, { name: 'Aquaculture', icon: '🐟' },
  { name: 'Equine', icon: '🐴' }, { name: 'Swine', icon: '🐷' }, { name: 'Birds & Avian', icon: '🦅' },
  { name: "Farmer's Produce", icon: '🌿' },
];

export default function SellerRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '', ownerName: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '',
    categories: [],
    gstNumber: '', fssaiLicense: '',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat],
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.businessName) newErrors.businessName = 'Required';
      if (!form.ownerName) newErrors.ownerName = 'Required';
      if (!form.phone || !/^\d{10}$/.test(form.phone)) newErrors.phone = '10-digit mobile number required';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required';
      if (!form.city) newErrors.city = 'Required';
      if (!form.state) newErrors.state = 'Required';
    }
    if (step === 2) {
      if (form.categories.length === 0) newErrors.categories = 'Select at least one category';
    }
    if (step === 3) {
      if (!form.password || form.password.length < 8) newErrors.password = 'Min 8 characters with number & special char';
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register-seller`, form);
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setErrors({ submit: res.data.message || 'Registration failed' });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: err.response?.data?.message || 'Server connection failed' });
    }
  };

  const INDIAN_STATES = ['Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Odisha','Assam','Jharkhand','Chhattisgarh','Uttarakhand'];

  if (submitted) {
    return (
      <div className="register-page" style={{ alignItems: 'center' }}>
        <div className="register-card" style={{ maxWidth: 500, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Registration Submitted!</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 24 }}>
            Your seller application for <b>{form.businessName}</b> has been submitted successfully.<br />
            Our team will review your documents and activate your account within <b>24–48 hours</b>.
          </p>
          <div style={{ background: 'var(--yellow-50)', border: '1px solid var(--yellow-200)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--gray-700)' }}>
              📧 Confirmation email sent to <b>{form.email}</b><br />
              📱 SMS alert sent to <b>{form.phone}</b>
            </div>
          </div>
          <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <div style={{ fontSize: 40 }}>🐄</div>
          <div>
            <div className="brand">PashuSevak</div>
            <div className="subtitle">Seller Registration — Join the dairy marketplace</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 32px', background: 'var(--yellow-50)', borderBottom: '1px solid var(--gray-100)' }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 3 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step > s ? '#2E7D32' : step === s ? 'var(--yellow-500)' : 'var(--gray-200)',
                  color: step > s ? '#fff' : step === s ? '#1A1A0E' : 'var(--gray-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.3s', flexShrink: 0,
                }}>
                  {step > s ? '✓' : s}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: step === s ? 'var(--gray-900)' : 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                  {['Business Info', 'Categories', 'Security'][i]}
                </span>
              </div>
              {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? '#2E7D32' : 'var(--gray-200)', margin: '0 12px', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        <div className="register-body">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>🏪 Business Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Business / Farm Name <span className="form-required">*</span></label>
                  <input className={`form-input ${errors.businessName ? 'error' : ''}`} value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="e.g. Rajan Dairy Farm" />
                  {errors.businessName && <div className="form-error">{errors.businessName}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name <span className="form-required">*</span></label>
                  <input className={`form-input ${errors.ownerName ? 'error' : ''}`} value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Full legal name" />
                  {errors.ownerName && <div className="form-error">{errors.ownerName}</div>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobile Number <span className="form-required">*</span></label>
                  <input className={`form-input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span className="form-required">*</span></label>
                  <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="seller@yourbusiness.com" />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Farm / Shop Address</label>
                <input className="form-input" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street address, landmark" />
              </div>
              <div className="form-row three">
                <div className="form-group">
                  <label className="form-label">City <span className="form-required">*</span></label>
                  <input className={`form-input ${errors.city ? 'error' : ''}`} value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">State <span className="form-required">*</span></label>
                  <select className={`form-select ${errors.state ? 'error' : ''}`} value={form.state} onChange={e => update('state', e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <div className="form-error">{errors.state}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" value={form.pincode} onChange={e => update('pincode', e.target.value)} placeholder="6-digit pincode" maxLength={6} />
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={nextStep}>Continue →</button>
            </div>
          )}

          {/* Step 2: Categories & Documents */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>📦 Product Categories</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16 }}>Select all categories you plan to sell in. Hold Ctrl (Windows) or ⌘ Command (Mac) to select multiple categories.</p>

              <div className="form-group">
                <label className="form-label">Categories <span className="form-required">*</span></label>
                <div className="category-grid">
                  {CATEGORIES.map(cat => (
                    <div key={cat.name} className={`category-chip ${form.categories.includes(cat.name) ? 'selected' : ''}`} onClick={() => toggleCategory(cat.name)}>
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      {form.categories.includes(cat.name) && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#2E7D32' }} />}
                    </div>
                  ))}
                </div>
                {errors.categories && <div className="form-error">{errors.categories}</div>}
                {form.categories.length > 0 && <div className="form-help">Selected: {form.categories.join(', ')}</div>}
              </div>

              <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📄 License & Tax Details (optional at registration)</div>
                <div className="form-group">
                  <label className="form-label">GST Number <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(optional)</span></label>
                  <input className="form-input" value={form.gstNumber} onChange={e => update('gstNumber', e.target.value.toUpperCase())} placeholder="e.g. 27AABCN1234A1Z5" maxLength={15} />
                  <div className="form-help">ℹ️ 15-character GST Identification Number</div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">FSSAI License Number <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(if applicable)</span></label>
                  <input className="form-input" value={form.fssaiLicense} onChange={e => update('fssaiLicense', e.target.value)} placeholder="e.g. 12345678901234" maxLength={14} />
                  <div className="form-help">ℹ️ 14-digit FSSAI licence — required for food & feed products</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={prevStep}><ArrowLeft size={16} /> Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={nextStep}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>🔒 Create Your Password</h3>

              {errors.submit && (
                <div style={{ color: '#D32F2F', background: '#FFEBEE', border: '1px solid #FFCDD2', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {errors.submit}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password <span className="form-required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} style={{ paddingRight: 38 }} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="form-help">🔒 Min 8 characters with a number & special character</div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password <span className="form-required">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirm ? 'text' : 'password'} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} style={{ paddingRight: 38 }} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Re-enter your password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>

              <div style={{ background: 'var(--yellow-50)', border: '1px solid var(--yellow-200)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-700)', lineHeight: 1.8 }}>
                  By registering, you agree to PashuSevak's <b>Terms of Service</b> and <b>Seller Policy</b>.<br />
                  Platform commission: <b>5%</b> | Payout cycle: <b>Weekly</b>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={prevStep}><ArrowLeft size={16} /> Back</button>
                <button type="submit" className="register-cta" style={{ flex: 1, margin: 0 }}>
                  <Store size={20} /> Register as Seller
                </button>
              </div>

              <button type="button" style={{ width: '100%', marginTop: 10, padding: 12, background: 'none', border: '1.5px solid var(--gray-200)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--gray-600)' }}>
                Maybe Later
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
