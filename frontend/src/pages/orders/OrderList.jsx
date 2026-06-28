import { useState } from 'react';
import {
  Search, X, Eye, CheckCircle, XCircle,
  Truck, Package, ArrowLeft, ArrowRight
} from 'lucide-react';
import { MOCK_ORDERS } from '../../data/mockData';

function OrderDetailDrawer({ order, onClose }) {
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLogged, setOverrideLogged] = useState(false);

  if (!order) return null;

  const timelineSteps = [
    {
      label: 'Order Placed',
      status: 'done',
      timestamp: order.orderDate,
      note: 'Payment confirmed',
    },
    {
      label: 'Seller Packed',
      status: ['packed', 'in_transit', 'out_for_delivery', 'delivered'].includes(order.status) ? 'done' : 'pending',
      timestamp: order.packedDate || '',
      note: 'Ready for pickup',
    },
    {
      label: 'In Transit',
      status: order.status === 'in_transit'
        ? 'active'
        : ['out_for_delivery', 'delivered'].includes(order.status)
        ? 'done'
        : 'pending',
      timestamp: order.shippedDate || '',
      note: `${order.courierName || ''} ${order.awb || ''}`.trim(),
    },
    {
      label: 'Out for Delivery',
      status: order.status === 'out_for_delivery'
        ? 'active'
        : order.status === 'delivered'
        ? 'done'
        : 'pending',
      timestamp: order.outForDeliveryDate || '',
      note: '',
    },
    {
      label: 'Delivered',
      status: order.status === 'delivered' ? 'done' : 'pending',
      timestamp: order.deliveredDate || '',
      note: '',
    },
  ];

  const handleOverride = () => {
    if (!overrideStatus || !overrideReason.trim()) return;
    setOverrideLogged(true);
    setTimeout(() => setOverrideLogged(false), 3000);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3 className="drawer-title">{order.orderId}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
              <span className={`status-badge ${order.status}`}>{(order.status || '').replace(/_/g, ' ')}</span>
              <strong>₹{(order.grossAmount || 0).toLocaleString()}</strong>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-body">
          {/* Timeline */}
          <div className="timeline-section">
            <h4>Order Timeline</h4>
            <div className="timeline">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.status}`}>
                  <div className="timeline-dot"></div>
                  {idx < timelineSteps.length - 1 && <div className="timeline-line"></div>}
                  <div className="timeline-content">
                    <div className="timeline-label">{step.label}</div>
                    {step.timestamp && <div className="timeline-time">{step.timestamp}</div>}
                    {step.note && <div className="timeline-note">{step.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer Info */}
          <div className="drawer-section">
            <h4>Buyer Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{order.buyerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{order.buyerPhone}</span>
              </div>
              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Address</span>
                <span className="info-value">{order.deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="drawer-section">
            <h4>Items</h4>
            <table className="data-table mini-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.price}</td>
                    <td>₹{(item.qty * item.price).toLocaleString()}</td>
                  </tr>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Info */}
          <div className="drawer-section">
            <h4>Payment Details</h4>
            <div className="payment-breakdown">
              <div className="payment-row">
                <span>Payment Mode</span>
                <span>{order.paymentMode}</span>
              </div>
              <div className="payment-row">
                <span>Payment Status</span>
                <span className={`status-badge ${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
              <div className="payment-row">
                <span>Gross Amount</span>
                <span>₹{(order.grossAmount || 0).toLocaleString()}</span>
              </div>
              <div className="payment-row deduction">
                <span>Gateway Fee (2.5%)</span>
                <span>-₹{((order.grossAmount || 0) * 0.025).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="drawer-section">
            <h4>Shipping Details</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Courier</span>
                <span className="info-value">{order.courierName || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">AWB</span>
                <span className="info-value mono">{order.awb || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mode</span>
                <span className="info-value">{order.shippingMode || '—'}</span>
              </div>
            </div>
          </div>

          {/* Manual Status Override */}
          <div className="drawer-section override-section">
            <h4>⚙️ Manual Status Override</h4>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                className="form-select"
                value={overrideStatus}
                onChange={e => setOverrideStatus(e.target.value)}
              >
                <option value="">Select status...</option>
                <option value="packed">Packed</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="rto">RTO</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Reason for override..."
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            {overrideLogged && (
              <div className="audit-log-notice">
                <CheckCircle size={14} /> Action logged to audit trail
              </div>
            )}
            <button className="btn btn-primary" onClick={handleOverride}>
              Submit Override
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderList() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sellerFilter, setSellerFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const tabs = [
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered Today' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'all', label: 'All' },
    { key: 'rto', label: 'RTO' },
  ];

  const counts = {};
  tabs.forEach(t => {
    counts[t.key] = t.key === 'all'
      ? MOCK_ORDERS.length
      : MOCK_ORDERS.filter(o => o.status === t.key).length;
  });

  const sellers = [...new Set(MOCK_ORDERS.map(o => o.sellerName).filter(Boolean))];

  const filtered = MOCK_ORDERS.filter(o => {
    const matchTab = activeTab === 'all' || o.status === activeTab;
    const matchSearch = !search ||
      (o.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.buyerName || '').toLowerCase().includes(search.toLowerCase());
    const matchSeller = !sellerFilter || o.sellerName === sellerFilter;
    const matchPayment = !paymentFilter || o.paymentMode === paymentFilter;
    return matchTab && matchSearch && matchSeller && matchPayment;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track and manage all marketplace orders</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-tile amber">
          <div className="kpi-icon"><Truck size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts['in_transit']}</div>
            <div className="kpi-label">In Transit</div>
          </div>
        </div>
        <div className="kpi-tile yellow">
          <div className="kpi-icon"><Package size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts['out_for_delivery']}</div>
            <div className="kpi-label">Out for Delivery</div>
          </div>
        </div>
        <div className="kpi-tile green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts['delivered']}</div>
            <div className="kpi-label">Delivered Today</div>
          </div>
        </div>
        <div className="kpi-tile red">
          <div className="kpi-icon"><XCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{counts['cancelled']}</div>
            <div className="kpi-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="tabs-row">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.key); setPage(1); }}
          >
            {t.label} <span className="tab-count">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by Order ID or buyer..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select" value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}>
          <option value="">All Sellers</option>
          {sellers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="date"
          className="form-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ width: 150 }}
        />
        <input
          type="date"
          className="form-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ width: 150 }}
        />
        <select className="form-select" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Modes</option>
          <option value="COD">COD</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="NetBanking">Net Banking</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Courier</th>
              <th>AWB</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(order => (
              <tr
                key={order.orderId}
                className="table-row"
                onClick={() => setSelectedOrder(order)}
                style={{ cursor: 'pointer' }}
              >
                <td><span className="mono">{order.orderId}</span></td>
                <td>{(order.items || []).length} item(s)</td>
                <td>{order.sellerName}</td>
                <td>{order.buyerName}</td>
                <td>₹{(order.grossAmount || 0).toLocaleString()}</td>
                <td><span className="badge badge-payment">{order.paymentMode}</span></td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {(order.status || '').replace(/_/g, ' ')}
                  </span>
                </td>
                <td>{order.courierName}</td>
                <td><span className="mono">{order.awb}</span></td>
                <td>{order.orderDate}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="action-btns">
                    <button className="btn btn-ghost" onClick={() => setSelectedOrder(order)}>
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
