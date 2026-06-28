import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Save, FileText, Upload, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SellerProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Seller State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  // KYC & Tax Info
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [kycDocs, setKycDocs] = useState([]);
  
  // Bank Details
  const [accountNo, setAccountNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');

  // Local uploads simulation state
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const fetchSellerProfile = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      // Fetch details using the endpoint GET /api/sellers/:id
      const sellerId = user?.id || user?._id;
      if (!sellerId) return;

      const res = await axios.get(`http://localhost:5000/api/sellers/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const s = res.data.seller;
        setBusinessName(s.businessName || '');
        setOwnerName(s.ownerName || '');
        setPhone(s.phone || '');
        setEmail(s.email || '');
        setAddress(s.address || '');
        setCity(s.city || '');
        setState(s.state || '');
        setPincode(s.pincode || '');
        setGstNumber(s.gstNumber || '');
        setFssaiLicense(s.fssaiLicense || '');
        setKycDocs(s.kycDocs || []);
        
        if (s.bankDetails) {
          setAccountNo(s.bankDetails.accountNo || '');
          setIfsc(s.bankDetails.ifsc || '');
          setAccountHolder(s.bankDetails.accountHolder || '');
          setBankName(s.bankDetails.bankName || '');
        }
      }
    } catch (err) {
      console.error('Fetch seller profile error:', err);
      toast.error('Failed to load profile details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('ps_token');
      const sellerId = user?.id || user?._id;
      
      const res = await axios.put(`http://localhost:5000/api/sellers/${sellerId}`, {
        businessName,
        ownerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        gstNumber,
        fssaiLicense,
        bankDetails: {
          accountNo,
          ifsc,
          accountHolder,
          bankName
        },
        kycDocs
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success('Profile settings saved successfully.');
        fetchSellerProfile();
      }
    } catch (err) {
      console.error('Save profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(type);
    // Simulate server upload lag
    setTimeout(async () => {
      const mockUrl = `/uploads/${type.toLowerCase()}_proof_${Date.now()}.pdf`;
      
      // Update local kycDocs state or add new
      let updatedDocs = [...kycDocs];
      const existingIdx = updatedDocs.findIndex(d => d.type === type);
      
      if (existingIdx > -1) {
        updatedDocs[existingIdx] = {
          ...updatedDocs[existingIdx],
          url: mockUrl,
          status: 'pending',
          rejectionReason: ''
        };
      } else {
        updatedDocs.push({
          type,
          url: mockUrl,
          status: 'pending'
        });
      }

      // Save directly to server
      try {
        const token = localStorage.getItem('ps_token');
        const sellerId = user?.id || user?._id;
        const res = await axios.put(`http://localhost:5000/api/sellers/${sellerId}`, {
          kycDocs: updatedDocs
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          toast.success(`${type} uploaded successfully. Awaiting verification.`);
          setKycDocs(updatedDocs);
        }
      } catch (err) {
        console.error('KYC upload error:', err);
        toast.error('Failed to submit uploaded document.');
      } finally {
        setUploadingDoc(null);
      }
    }, 1500);
  };

  const INDIAN_STATES = ['Andhra Pradesh','Bihar','Delhi','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Odisha','Assam','Jharkhand','Chhattisgarh','Uttarakhand'];

  const getDocStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle size={18} style={{ color: '#2E7D32' }} />;
      case 'rejected': return <XCircle size={18} style={{ color: '#C62828' }} />;
      case 'pending':
      default:
        return <AlertTriangle size={18} style={{ color: '#EF6C00' }} />;
    }
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'verified': return <span className="status-badge live" style={{ background: '#E8F5E9', color: '#2E7D32' }}>Verified</span>;
      case 'rejected': return <span className="status-badge rejected" style={{ background: '#FFEBEE', color: '#C62828' }}>Rejected</span>;
      case 'pending':
      default:
        return <span className="status-badge pending" style={{ background: '#FFF3E0', color: '#EF6C00' }}>Pending Verification</span>;
    }
  };

  const navLinks = [
    { to: '/seller', label: 'Dashboard' },
    { to: '/seller/products', label: 'My Products' },
    { to: '/seller/orders', label: 'My Orders' },
    { to: '/seller/payments', label: 'My Payments' },
    { to: '/seller/profile', label: 'My Profile', active: true }
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
                    color: link.active ? 'var(--yellow-50)' : 'rgba(255,255,255,0.7)', 
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
      <main style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--gray-900)' }}>
              My Seller Profile
            </h2>
            <p className="page-subtitle">Configure your business credentials, payment routing bank, and upload KYC paperwork</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="tab-pill active">Loading profile details...</div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              
              {/* Business details */}
              <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, borderBottom: '1px solid var(--gray-100)', paddingBottom: 10 }}>🏪 Business Information</h3>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Business / Farm Name</label>
                  <input type="text" className="form-input" value={businessName} onChange={e => setBusinessName(e.target.value)} required />
                </div>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Owner Name</label>
                  <input type="text" className="form-input" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">Mobile Number</label>
                    <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={email} disabled style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }} />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Farm / Store Address</label>
                  <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">State</label>
                    <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-input" value={pincode} onChange={e => setPincode(e.target.value)} maxLength={6} />
                  </div>
                </div>
              </div>

              {/* Bank & Tax Details */}
              <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontWeight: 800, fontSize: 16, borderBottom: '1px solid var(--gray-100)', paddingBottom: 10 }}>🏦 Bank & Tax Details</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">GSTIN Identification</label>
                    <input type="text" className="form-input" value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())} placeholder="e.g. 27AABCN1234A1Z5" maxLength={15} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">FSSAI License Number</label>
                    <input type="text" className="form-input" value={fssaiLicense} onChange={e => setFssaiLicense(e.target.value)} placeholder="e.g. 12345678901234" maxLength={14} />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Settlement Bank Account Details</label>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Account Holder Name</label>
                  <input type="text" className="form-input" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="As in bank passbook" />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="form-label">Bank Name</label>
                  <input type="text" className="form-input" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">Account Number</label>
                    <input type="text" className="form-input" value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="Settlement account number" />
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="form-label">IFSC Code</label>
                    <input type="text" className="form-input" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} placeholder="IFSC" maxLength={11} />
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Uploads Paperwork Panel */}
            <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, borderBottom: '1px solid var(--gray-100)', paddingBottom: 10 }}>📄 Paperwork & KYC Compliance Docs</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {['GST Certificate', 'FSSAI License', 'Bank Proof'].map(docType => {
                  const doc = kycDocs.find(d => d.type === docType);
                  const isUploading = uploadingDoc === docType;
                  
                  return (
                    <div key={docType} style={{ border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--gray-50)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={18} style={{ color: 'var(--yellow-700)' }} />
                          <strong style={{ fontSize: 13 }}>{docType}</strong>
                        </div>
                        {doc && getDocStatusBadge(doc.status)}
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--gray-600)', minHeight: 40 }}>
                        {doc ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span>Uploaded Document: <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--yellow-700)', fontWeight: 600 }}>View File</a></span>
                            {doc.status === 'rejected' && (
                              <span style={{ color: '#C62828', display: 'flex', alignItems: 'center', gap: 4 }}>
                                ⚠️ Rejection Reason: {doc.rejectionReason || 'Invalid file format'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span>Please upload a scanned PDF or PNG copy of your {docType}.</span>
                        )}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                        <label className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: 12, padding: '8px 16px' }}>
                          <Upload size={14} />
                          {isUploading ? 'Uploading...' : doc ? 'Re-upload File' : 'Upload File'}
                          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => handleFileUpload(docType, e)} disabled={isUploading} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <Link to="/seller" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
