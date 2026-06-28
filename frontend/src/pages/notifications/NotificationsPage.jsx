import { useState } from 'react';
import {
  Bell, Check, X, CheckCircle, AlertTriangle, Package,
  CreditCard, ShoppingCart, Users
} from 'lucide-react';
import { MOCK_NOTIFICATIONS, MOCK_SELLERS } from '../../data/mockData';

const TYPE_ICONS = {
  seller_signup: <Users size={18} />,
  low_stock: <Package size={18} />,
  payout: <CreditCard size={18} />,
  order: <ShoppingCart size={18} />,
  alert: <AlertTriangle size={18} />,
};

const TYPE_COLORS = {
  seller_signup: 'var(--color-success, #22c55e)',
  low_stock: 'var(--color-warning, #f59e0b)',
  payout: 'var(--color-info, #6366f1)',
  order: 'var(--color-primary, #3b82f6)',
  alert: 'var(--color-danger, #ef4444)',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(
    (MOCK_NOTIFICATIONS || []).map((n, i) => ({ ...n, id: n.id || i }))
  );
  const [activeTab, setActiveTab] = useState('all');
  const [broadcastAudience, setBroadcastAudience] = useState('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [shipmentThreshold, setShipmentThreshold] = useState(5);
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'seller_signup', label: 'Seller Signups' },
    { key: 'low_stock', label: 'Low Stock' },
    { key: 'payout', label: 'Payouts' },
    { key: 'order', label: 'Orders' },
  ];

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    const sellerCounts = {
      all: (MOCK_SELLERS || []).length,
      active: (MOCK_SELLERS || []).filter(s => s.status === 'active').length,
      pending: (MOCK_SELLERS || []).filter(s => s.status === 'pending').length,
    };
    setBroadcastSent(sellerCounts[broadcastAudience] || 0);
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(null), 4000);
  };

  const handleSaveThresholds = () => {
    setThresholdsSaved(true);
    setTimeout(() => setThresholdsSaved(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notification Center</h1>
          <p className="page-subtitle">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <button className="btn btn-outline" onClick={markAllRead}>
          <Check size={16} /> Mark All Read
        </button>
      </div>

      {/* Tab Pills */}
      <div className="tabs-row">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            {t.key === 'unread' && unreadCount > 0 && (
              <span className="tab-count">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="card notifications-list">
        {filteredNotifs.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No notifications in this category.</p>
          </div>
        )}
        {filteredNotifs.map(notif => (
          <div
            key={notif.id}
            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
            onClick={() => markRead(notif.id)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="notif-icon"
              style={{ color: TYPE_COLORS[notif.type] || 'var(--text-muted)' }}
            >
              {TYPE_ICONS[notif.type] || <Bell size={18} />}
            </div>
            <div className="notif-body">
              <div className="notif-title">{notif.title}</div>
              <div className="notif-message">{notif.message}</div>
              <div className="notif-time">{notif.timestamp}</div>
            </div>
            {!notif.read && <div className="notif-dot"></div>}
          </div>
        ))}
      </div>

      {/* Broadcast Tool */}
      <div className="card broadcast-section" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-title">📢 Broadcast Tool</h3>
        <div className="form-group">
          <label className="form-label">Audience</label>
          <select
            className="form-select"
            value={broadcastAudience}
            onChange={e => setBroadcastAudience(e.target.value)}
          >
            <option value="all">All Sellers ({(MOCK_SELLERS || []).length})</option>
            <option value="active">Active Sellers ({(MOCK_SELLERS || []).filter(s => s.status === 'active').length})</option>
            <option value="pending">Pending Sellers ({(MOCK_SELLERS || []).filter(s => s.status === 'pending').length})</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Type your broadcast message..."
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>
        {broadcastSent !== null && (
          <div className="audit-log-notice" style={{ marginBottom: '0.75rem' }}>
            <CheckCircle size={15} /> Broadcast sent to {broadcastSent} sellers
          </div>
        )}
        <button className="btn btn-success" onClick={handleBroadcast} disabled={!broadcastMessage.trim()}>
          <Bell size={16} /> Send Broadcast
        </button>
      </div>

      {/* Alert Thresholds */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-title">⚙️ Alert Thresholds</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label className="form-label">Low Stock Threshold (units)</label>
            <input
              type="number"
              className="form-input"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
              min={1}
              style={{ width: 120 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Delayed Shipment Threshold (days)</label>
            <input
              type="number"
              className="form-input"
              value={shipmentThreshold}
              onChange={e => setShipmentThreshold(e.target.value)}
              min={1}
              style={{ width: 120 }}
            />
          </div>
          <div className="form-group">
            {thresholdsSaved && (
              <div className="audit-log-notice" style={{ marginBottom: '0.5rem' }}>
                <CheckCircle size={15} /> Thresholds saved
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSaveThresholds}>
              Save Thresholds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
