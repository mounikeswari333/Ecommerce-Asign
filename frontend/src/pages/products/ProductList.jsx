import { useState } from 'react';
import {
  Search, Download, Eye, Check, X, Package,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockData';

const CATEGORY_EMOJIS = {
  'Dairy': '🥛', 'Meat': '🥩', 'Poultry': '🐔', 'Eggs': '🥚',
  'Feed': '🌾', 'Supplements': '💊', 'Equipment': '🔧', 'Organic': '🌿',
};

export default function ProductList() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'live', label: 'Live' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'out_of_stock', label: 'Out of Stock' },
  ];

  const counts = {
    all: MOCK_PRODUCTS.length,
    pending_approval: MOCK_PRODUCTS.filter(p => p.status === 'pending_approval').length,
    live: MOCK_PRODUCTS.filter(p => p.status === 'live').length,
    rejected: MOCK_PRODUCTS.filter(p => p.status === 'rejected').length,
    out_of_stock: MOCK_PRODUCTS.filter(p => p.status === 'out_of_stock').length,
  };

  const sellers = [...new Set(MOCK_PRODUCTS.map(p => p.sellerName).filter(Boolean))];
  const categories = [...new Set(MOCK_PRODUCTS.map(p => p.category).filter(Boolean))];

  const filtered = MOCK_PRODUCTS.filter(p => {
    const matchTab = activeTab === 'all' || p.status === activeTab;
    const matchSearch = !search ||
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.productId || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    const matchSeller = !sellerFilter || p.sellerName === sellerFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchTab && matchSearch && matchCat && matchSeller && matchStatus;
  });

  const pendingProducts = MOCK_PRODUCTS.filter(p => p.status === 'pending_approval');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-subtitle">Review and manage all product listings</p>
        </div>
        <button className="btn btn-outline">
          <Download size={16} /> Export
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-tile blue">
          <div className="kpi-icon"><Package size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.all}</div>
            <div className="kpi-label">Total Products</div>
          </div>
        </div>
        <div className="kpi-tile amber">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.pending_approval}</div>
            <div className="kpi-label">Pending Approval</div>
          </div>
        </div>
        <div className="kpi-tile green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.live}</div>
            <div className="kpi-label">Live</div>
          </div>
        </div>
        <div className="kpi-tile red">
          <div className="kpi-icon"><XCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts.out_of_stock}</div>
            <div className="kpi-label">Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="tabs-row">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label} <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}>
          <option value="">All Sellers</option>
          {sellers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="live">Live</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="rejected">Rejected</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Approval Queue */}
      {pendingProducts.length > 0 && (activeTab === 'all' || activeTab === 'pending_approval') && (
        <div className="approval-queue-section" style={{ marginBottom: 32 }}>
          <h3 className="section-title" style={{ marginBottom: 16 }}>📋 Approval Queue ({pendingProducts.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pendingProducts.map(product => (
              <div 
                key={product.productId} 
                className="card" 
                style={{ 
                  padding: 20, 
                  borderRadius: 12, 
                  display: 'flex', 
                  gap: 20, 
                  alignItems: 'flex-start',
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div 
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 8, 
                    background: 'var(--yellow-100)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 28,
                    flexShrink: 0
                  }}
                >
                  {CATEGORY_EMOJIS[product.category] || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>{product.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Seller: {product.sellerName}</div>
                  
                  {/* Price Row and Category Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                    <span className="status-badge live" style={{ padding: '3px 8px', fontSize: 12 }}>
                      ₹{product.price}
                    </span>
                    <span style={{ fontSize: 12, textDecoration: 'line-through', color: 'var(--gray-505)' }}>
                      MRP: ₹{product.mrp}
                    </span>
                    <span className="status-badge draft" style={{ padding: '3px 8px', fontSize: 11 }}>
                      {product.category}
                    </span>
                  </div>

                  {rejectingId === product.productId ? (
                    <div className="reject-reason-wrap" style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        className="form-input"
                        placeholder="Rejection reason..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        style={{ flex: 1, maxWidth: 300 }}
                      />
                      <button className="btn btn-danger" onClick={() => setRejectingId(null)}>
                        <X size={13} /> Confirm Reject
                      </button>
                      <button className="btn btn-ghost" onClick={() => { setRejectingId(null); setRejectReason(''); }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="approval-card-actions" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                      <button className="btn btn-success"><Check size={13} /> Approve</button>
                      <button className="btn btn-danger" onClick={() => setRejectingId(product.productId)}>
                        <X size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Seller</th>
              <th>Price (₹)</th>
              <th>MRP (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.productId}>
                <td><span className="mono">{product.productId}</span></td>
                <td style={{ fontSize: '1.5rem' }}>{CATEGORY_EMOJIS[product.category] || '📦'}</td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td>{product.sellerName}</td>
                <td>₹{product.price}</td>
                <td>₹{product.mrp}</td>
                <td style={{
                  color: product.stock === 0
                    ? 'var(--color-danger, #ef4444)'
                    : product.stock < 10
                    ? 'var(--color-warning, #f59e0b)'
                    : 'inherit'
                }}>
                  {product.stock}
                </td>
                <td>
                  <span className={`status-badge ${product.status}`}>
                    {(product.status || '').replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-ghost" title="View"><Eye size={15} /></button>
                    {product.status === 'pending_approval' && (
                      <>
                        <button className="btn btn-success" title="Approve"><Check size={15} /></button>
                        <button
                          className="btn btn-danger"
                          title="Reject"
                          onClick={() => setRejectingId(product.productId)}
                        >
                          <X size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
