import { useState } from 'react';
import { Search, Eye, Check, X, FileText, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { MOCK_SELLERS } from '../../data/mockData';

// Flatten KYC docs from all sellers
function buildDocList() {
  const docs = [];
  (MOCK_SELLERS || []).forEach(seller => {
    const kycDocs = seller.kycDocs || [
      { type: 'GST Certificate', status: 'verified', uploadedDate: '2024-01-10', expiryDate: '2026-01-10' },
      { type: 'FSSAI License', status: 'pending', uploadedDate: '2024-02-01', expiryDate: '2024-07-01' },
      { type: 'PAN Card', status: 'verified', uploadedDate: '2024-01-10', expiryDate: null },
    ];
    kycDocs.forEach((doc, idx) => {
      docs.push({
        docId: `DOC-${seller.sellerId}-${idx + 1}`,
        sellerName: seller.businessName,
        sellerId: seller.sellerId,
        type: doc.type,
        uploadedDate: doc.uploadedDate,
        expiryDate: doc.expiryDate,
        status: doc.status,
      });
    });
  });
  return docs;
}

const DOC_TYPES = ['GST Certificate', 'FSSAI License', 'PAN Card', 'Bank Statement', 'Trade License'];

function isExpiringSoon(expiryDate) {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  const now = new Date();
  const diff = (exp - now) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff < 30;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidePanel, setSidePanel] = useState(null);

  const allDocs = buildDocList();
  const sellers = [...new Set(allDocs.map(d => d.sellerName).filter(Boolean))];

  const counts = {
    total: allDocs.length,
    pending: allDocs.filter(d => d.status === 'pending').length,
    verified: allDocs.filter(d => d.status === 'verified').length,
    expiring: allDocs.filter(d => isExpiringSoon(d.expiryDate)).length,
  };

  const filtered = allDocs.filter(d => {
    const matchSearch = !search ||
      (d.sellerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.docId || '').toLowerCase().includes(search.toLowerCase());
    const matchSeller = !sellerFilter || d.sellerName === sellerFilter;
    const matchType = !typeFilter || d.type === typeFilter;
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchSeller && matchType && matchStatus;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Repository</h1>
          <p className="page-subtitle">Manage and verify all seller documents</p>
        </div>
        <button className="btn btn-outline"><Download size={16} /> Export</button>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-tile blue">
          <div className="kpi-icon"><FileText size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.total}</div>
            <div className="kpi-label">Total Documents</div>
          </div>
        </div>
        <div className="kpi-tile amber">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.pending}</div>
            <div className="kpi-label">Pending Review</div>
          </div>
        </div>
        <div className="kpi-tile green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.verified}</div>
            <div className="kpi-label">Verified</div>
          </div>
        </div>
        <div className="kpi-tile red">
          <div className="kpi-icon"><XCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.expiring}</div>
            <div className="kpi-label">Expiring Soon</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by seller or doc ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}>
          <option value="">All Sellers</option>
          {sellers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Data Table */}
        <div className="table-card" style={{ flex: 1 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Seller</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const expiring = isExpiringSoon(doc.expiryDate);
                return (
                  <tr
                    key={doc.docId}
                    style={{ background: expiring ? 'rgba(239,68,68,0.06)' : undefined }}
                  >
                    <td><span className="mono">{doc.docId}</span></td>
                    <td>{doc.sellerName}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={14} />
                        {doc.type}
                      </span>
                    </td>
                    <td>{doc.uploadedDate}</td>
                    <td>
                      {doc.expiryDate ? (
                        <span style={{ color: expiring ? 'var(--color-danger, #ef4444)' : 'inherit', fontWeight: expiring ? 600 : 400 }}>
                          {doc.expiryDate} {expiring && '⚠️'}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${doc.status}`}>{doc.status}</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost" title="View" onClick={() => setSidePanel(doc)}>
                          <Eye size={15} />
                        </button>
                        {doc.status === 'pending' && (
                          <>
                            <button className="btn btn-success" title="Approve"><Check size={15} /></button>
                            <button className="btn btn-danger" title="Reject"><X size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Panel */}
        {sidePanel && (
          <div className="doc-side-panel card" style={{ width: 320, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Document Preview</h4>
              <button className="btn btn-ghost" onClick={() => setSidePanel(null)}><X size={16} /></button>
            </div>
            <div className="doc-preview">
              <div className="doc-preview-icon">
                <FileText size={48} />
              </div>
              <div className="info-grid" style={{ marginTop: '1rem' }}>
                <div className="info-item">
                  <span className="info-label">Doc ID</span>
                  <span className="info-value mono">{sidePanel.docId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{sidePanel.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Seller</span>
                  <span className="info-value">{sidePanel.sellerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uploaded</span>
                  <span className="info-value">{sidePanel.uploadedDate}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Expiry</span>
                  <span className="info-value">{sidePanel.expiryDate || '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`status-badge ${sidePanel.status}`}>{sidePanel.status}</span>
                </div>
              </div>
              {sidePanel.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-success" style={{ flex: 1 }}>
                    <Check size={14} /> Approve
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
