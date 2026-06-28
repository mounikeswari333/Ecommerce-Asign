import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Check, X,
  Users, AlertTriangle, XCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerList() {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const perPage = 10;

  const fetchSellersList = async () => {
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.get(`${API_BASE}/api/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSellers(res.data.sellers);
      }
    } catch (err) {
      console.error('Fetch sellers list error:', err);
      toast.error('Failed to load sellers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellersList();
  }, []);

  const handleApprove = async (sellerId, e) => {
    e.stopPropagation();
    setActionLoading(sellerId);
    try {
      const token = localStorage.getItem('ps_token');
      const res = await axios.post(`${API_BASE}/api/sellers/${sellerId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Seller approved and activated successfully.');
        fetchSellersList();
      }
    } catch (err) {
      console.error('Approve seller error:', err);
      toast.error(err.response?.data?.message || 'Failed to approve seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (sellerId, e) => {
    e.stopPropagation();
    setActionLoading(sellerId);
    try {
      const token = localStorage.getItem('ps_token');
      // Suspend by setting status to suspended
      const res = await axios.put(`${API_BASE}/api/sellers/${sellerId}/status`, {
        status: 'suspended',
        reason: 'Suspended by admin'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Seller status updated to suspended.');
        fetchSellersList();
      }
    } catch (err) {
      console.error('Suspend seller error:', err);
      toast.error(err.response?.data?.message || 'Failed to suspend seller.');
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'suspended', label: 'Suspended' },
    { key: 'blacklisted', label: 'Blacklisted' },
  ];

  const cities = [...new Set(sellers.map(s => s.city).filter(Boolean))];

  const counts = {
    all: sellers.length,
    active: sellers.filter(s => s.status === 'active').length,
    pending: sellers.filter(s => s.status === 'pending').length,
    suspended: sellers.filter(s => s.status === 'suspended').length,
    blacklisted: sellers.filter(s => s.status === 'blacklisted').length,
  };

  const filtered = sellers.filter(s => {
    const matchTab = activeTab === 'all' || s.status === activeTab;
    const matchSearch =
      !search ||
      (s.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.sellerId || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.ownerName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchCity = !cityFilter || s.city === cityFilter;
    return matchTab && matchSearch && matchStatus && matchCity;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="page-container" style={{ padding: 24 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 22, fontWeight: 800 }}>Seller Management</h1>
          <p className="page-subtitle" style={{ color: 'var(--gray-500)', fontSize: 13 }}>Manage and monitor all registered sellers</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="kpi-tile blue" style={{ background: '#E3F2FD', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>👥</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>{counts.all}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Total Sellers</div>
          </div>
        </div>
        <div className="kpi-tile green" style={{ background: '#E8F5E9', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>✅</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>{counts.active}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Active</div>
          </div>
        </div>
        <div className="kpi-tile amber" style={{ background: '#FFF3E0', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>⏳</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>{counts.pending}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Pending</div>
          </div>
        </div>
        <div className="kpi-tile red" style={{ background: '#FFEBEE', padding: 20, borderRadius: 12 }}>
          <div className="kpi-icon" style={{ fontSize: 24 }}>🚫</div>
          <div className="kpi-body">
            <div className="kpi-value" style={{ fontSize: 24, fontWeight: 800 }}>{counts.suspended + counts.blacklisted}</div>
            <div className="kpi-label" style={{ fontSize: 12, color: 'var(--gray-600)' }}>Suspended / Blacklisted</div>
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="card" style={{ background: '#fff', padding: 20, border: '1px solid var(--gray-200)', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Search Sellers</label>
            <input className="form-input" placeholder="Search business, owner, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group" style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Filter by Status</label>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
          <div className="form-group" style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Filter by City</label>
            <select className="form-select" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.key); setPage(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === t.key ? '1px solid var(--yellow-500)' : '1px solid var(--gray-200)',
              background: activeTab === t.key ? 'var(--yellow-400)' : '#fff',
              color: 'var(--gray-900)'
            }}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--yellow-200)', borderTopColor: 'var(--yellow-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : paginated.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12 }}>
          <strong>No sellers found matching the filters.</strong>
        </div>
      ) : (
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Business Name</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>GSTIN</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(seller => {
                  const isExpanded = expandedRow === seller._id;
                  return (
                    <>
                      <tr
                        key={seller._id}
                        className={`table-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : seller._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td><span className="mono">{seller.sellerId}</span></td>
                        <td><strong>{seller.businessName}</strong></td>
                        <td>{seller.ownerName}</td>
                        <td>{seller.city}</td>
                        <td>
                          <span className={`status-badge ${seller.status}`}>{seller.status}</span>
                        </td>
                        <td>{seller.gstNumber || 'N/A'}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="action-btns" style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              onClick={() => navigate(`/admin/sellers/${seller._id}`)}
                            >
                              <Eye size={14} style={{ marginRight: 4 }} /> View
                            </button>
                            {seller.status === 'pending' && (
                              <button
                                className="btn btn-success"
                                style={{ padding: '6px 10px', fontSize: 12 }}
                                disabled={actionLoading === seller._id}
                                onClick={(e) => handleApprove(seller._id, e)}
                              >
                                Approve
                              </button>
                            )}
                            {seller.status === 'active' && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px 10px', fontSize: 12 }}
                                disabled={actionLoading === seller._id}
                                onClick={(e) => handleSuspend(seller._id, e)}
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: 'var(--gray-50)' }}>
                          <td colSpan={7} style={{ padding: 16 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: 12 }}>
                              <div><strong>Owner Name:</strong> {seller.ownerName}</div>
                              <div><strong>Contact:</strong> {seller.phone} / {seller.email}</div>
                              <div><strong>Address:</strong> {seller.address}, {seller.city}, {seller.state} - {seller.pincode}</div>
                              <div><strong>GSTIN:</strong> {seller.gstNumber || 'N/A'}</div>
                              <div><strong>FSSAI License:</strong> {seller.fssaiLicense || 'N/A'}</div>
                              <div><strong>Commission Rate:</strong> {seller.commissionRate || 5}%</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
