import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, X, AlertTriangle,
  CheckCircle, XCircle, FileText, ShoppingCart, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({ totalGross: 0, totalNet: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionModal, setShowActionModal] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [commissionOverride, setCommissionOverride] = useState(5);

  const fetchSellerDetails = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.get(`${API_BASE}/api/sellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSeller(res.data.seller);
        setOrders(res.data.orders || []);
        setPaymentSummary(res.data.paymentSummary || { totalGross: 0, totalNet: 0, count: 0 });
        setCommissionOverride(res.data.seller.commissionRate || 5);
      }
    } catch (err) {
      console.error('Fetch seller details error:', err);
      toast.error('Failed to load seller details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDetails();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.post(`${API_BASE}/api/sellers/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Seller approved and activated successfully.');
        fetchSellerDetails();
        setShowActionModal(null);
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.response?.data?.message || 'Failed to approve seller.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.put(`${API_BASE}/api/sellers/${id}/status`, {
        status,
        reason: actionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Seller status updated to ${status}.`);
        fetchSellerDetails();
        setShowActionModal(null);
        setActionReason('');
      }
    } catch (err) {
      console.error('Status change error:', err);
      toast.error(err.response?.data?.message || 'Failed to update seller status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCommission = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.put(`${API_BASE}/api/sellers/${id}/commission`, {
        commissionRate: parseFloat(commissionOverride)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Commission rate updated successfully.');
        fetchSellerDetails();
      }
    } catch (err) {
      console.error('Commission update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update commission rate.');
    }
  };

  const handleKycAction = async (docIndex, status, reason = '') => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.put(`${API_BASE}/api/sellers/${id}/kyc/${docIndex}`, {
        status,
        rejectionReason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`KYC document status set to ${status}.`);
        fetchSellerDetails();
      }
    } catch (err) {
      console.error('KYC update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update KYC document status.');
    }
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'verified': return <span className="status-badge live" style={{ background: '#E8F5E9', color: '#2E7D32' }}>Verified</span>;
      case 'rejected': return <span className="status-badge rejected" style={{ background: '#FFEBEE', color: '#C62828' }}>Rejected</span>;
      case 'pending':
      default:
        return <span className="status-badge pending" style={{ background: '#FFF3E0', color: '#EF6C00' }}>Pending Review</span>;
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'kyc', label: 'KYC Documents' },
    { key: 'bank', label: 'Bank Details' },
    { key: 'orders', label: 'Orders' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--yellow-200)', borderTopColor: 'var(--yellow-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!seller) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <h2>Seller Not Found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/admin/sellers')}>Back to Sellers List</button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ padding: 24 }}>
      {/* Back */}
      <button className="btn btn-ghost back-btn" onClick={() => navigate('/admin/sellers')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Sellers
      </button>

      {/* Seller Header */}
      <div className="seller-header card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, background: 'var(--yellow-400)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
            {seller.businessName[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{seller.businessName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span className="badge badge-id" style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{seller.sellerId}</span>
              <span className={`status-badge ${seller.status}`}>{seller.status}</span>
              <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>Owner: {seller.ownerName}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {seller.status === 'pending' && (
            <button className="btn btn-success" onClick={() => setShowActionModal('approve')} style={{ padding: '8px 16px', fontSize: 13 }}>
              Approve Seller
            </button>
          )}
          {seller.status === 'active' && (
            <button className="btn btn-danger" onClick={() => setShowActionModal('suspend')} style={{ padding: '8px 16px', fontSize: 13 }}>
              Suspend Seller
            </button>
          )}
          {seller.status !== 'blacklisted' && (
            <button className="btn btn-outline" onClick={() => setShowActionModal('blacklist')} style={{ padding: '8px 16px', fontSize: 13 }}>
              Blacklist
            </button>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="kpi-tile blue" style={{ background: '#E3F2FD', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>🛒</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>{paymentSummary.count || orders.length}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Total Orders</div>
          </div>
        </div>
        <div className="kpi-tile green" style={{ background: '#E8F5E9', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>📈</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>₹{(paymentSummary.totalGross || 0).toLocaleString()}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Total GMV</div>
          </div>
        </div>
        <div className="kpi-tile amber" style={{ background: '#FFF3E0', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>💰</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>₹{(paymentSummary.totalNet || 0).toLocaleString()}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Net Payouts Settled</div>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--gray-200)', marginBottom: 20 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t.key ? '3px solid var(--yellow-500)' : '3px solid transparent',
              fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? 'var(--gray-900)' : 'var(--gray-600)',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="card" style={{ background: '#fff', padding: 24, border: '1px solid var(--gray-200)', borderRadius: 12 }}>
        
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>🏪 Contact & Business Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, fontSize: 13 }}>
                <div><span style={{ color: 'var(--gray-500)' }}>Business Name:</span> <strong>{seller.businessName}</strong></div>
                <div><span style={{ color: 'var(--gray-500)' }}>Owner Name:</span> {seller.ownerName}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>Email:</span> {seller.email}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>Phone:</span> {seller.phone}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>Address:</span> {seller.address}, {seller.city}, {seller.state} - {seller.pincode}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>Onboarded At:</span> {seller.onboardedAt ? new Date(seller.onboardedAt).toLocaleDateString() : 'Pending Onboarding'}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>⚙️ Platform Fees Configuration</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 220 }}>
                  <label className="form-label" style={{ fontSize: 12 }}>Commission Rate (%)</label>
                  <input type="number" className="form-input" value={commissionOverride} onChange={e => setCommissionOverride(e.target.value)} min={0} max={100} />
                </div>
                <button className="btn btn-primary" onClick={handleSaveCommission} style={{ marginTop: 22 }}>
                  Save Commission
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📄 KYC Document Compliance Records</h3>
            {seller.kycDocs && seller.kycDocs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {seller.kycDocs.map((doc, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--gray-200)', borderRadius: 10, padding: 16, background: 'var(--gray-50)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{doc.type}</strong>
                      {getDocStatusBadge(doc.status)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                      File Link: <a href={`${API_BASE}${doc.url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--yellow-700)', fontWeight: 600 }}>Open File</a>
                    </div>
                    {doc.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                        <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 11, flex: 1 }} onClick={() => handleKycAction(idx, 'verified')}>
                          Approve
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 11, flex: 1 }} onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason !== null) handleKycAction(idx, 'rejected', reason);
                        }}>
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No KYC documents uploaded by the seller.</div>
            )}
          </div>
        )}

        {activeTab === 'bank' && (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>🏦 Bank Settlement Account</h3>
            {seller.bankDetails ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 13 }}>
                <div><span style={{ color: 'var(--gray-500)' }}>Bank Name:</span> <strong>{seller.bankDetails.bankName || 'N/A'}</strong></div>
                <div><span style={{ color: 'var(--gray-500)' }}>Account Number:</span> {seller.bankDetails.accountNo || 'N/A'}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>IFSC Code:</span> {seller.bankDetails.ifsc || 'N/A'}</div>
                <div><span style={{ color: 'var(--gray-500)' }}>Account Holder:</span> {seller.bankDetails.accountHolder || 'N/A'}</div>
              </div>
            ) : (
              <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No bank details configured.</div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📦 Recent Orders</h3>
            {orders.length > 0 ? (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Amount</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id}>
                        <td><span className="mono">{o.orderId}</span></td>
                        <td>{o.buyerName}</td>
                        <td>₹{o.grossAmount}</td>
                        <td>{o.paymentMode}</td>
                        <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>No orders recorded for this seller.</div>
            )}
          </div>
        )}

      </div>

      {/* Modal Actions */}
      {showActionModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: '#fff', borderRadius: 12, width: 450, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>
              {showActionModal === 'approve' && 'Confirm Approval'}
              {showActionModal === 'suspend' && 'Confirm Suspension'}
              {showActionModal === 'blacklist' && 'Confirm Blacklist'}
            </h3>
            
            <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>
              {showActionModal === 'approve' && 'Are you sure you want to approve this seller application? The seller will be notified and can log in immediately.'}
              {showActionModal === 'suspend' && 'Enter reason for suspending this seller. They will lose access to uploading products.'}
              {showActionModal === 'blacklist' && 'Confirm if you want to blacklist this seller business. All live listings will be archived.'}
            </p>

            {showActionModal !== 'approve' && (
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label className="form-label">Action Reason</label>
                <textarea className="form-input" style={{ minHeight: 80, padding: 10 }} value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="Provide compliance or operational explanation..." required />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button className="btn btn-outline" onClick={() => { setShowActionModal(null); setActionReason(''); }}>
                Cancel
              </button>
              
              {showActionModal === 'approve' && (
                <button className="btn btn-success" disabled={actionLoading} onClick={handleApprove}>
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              )}
              {showActionModal === 'suspend' && (
                <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleStatusChange('suspended')}>
                  {actionLoading ? 'Suspending...' : 'Suspend'}
                </button>
              )}
              {showActionModal === 'blacklist' && (
                <button className="btn btn-danger" style={{ background: '#212121' }} disabled={actionLoading} onClick={() => handleStatusChange('blacklisted')}>
                  {actionLoading ? 'Blacklisting...' : 'Blacklist'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
