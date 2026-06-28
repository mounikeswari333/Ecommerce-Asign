import { useState } from 'react';
import {
  Settings, Check, X, Plus, Edit, Trash2, Users
} from 'lucide-react';

const MOCK_ADMINS = [
  { id: 1, name: 'Ravi Kumar', email: 'ravi@pashusevak.com', role: 'super_admin', status: 'active', lastLogin: '2024-06-24 10:30' },
  { id: 2, name: 'Priya Sharma', email: 'priya@pashusevak.com', role: 'ops_admin', status: 'active', lastLogin: '2024-06-24 09:15' },
  { id: 3, name: 'Amit Singh', email: 'amit@pashusevak.com', role: 'finance_admin', status: 'active', lastLogin: '2024-06-23 16:45' },
  { id: 4, name: 'Sneha Patel', email: 'sneha@pashusevak.com', role: 'catalog_admin', status: 'active', lastLogin: '2024-06-22 11:20' },
  { id: 5, name: 'Arjun Das', email: 'arjun@pashusevak.com', role: 'support_admin', status: 'inactive', lastLogin: '2024-06-20 08:00' },
];

const ROLE_COLORS = {
  super_admin: 'danger',
  ops_admin: 'active',
  finance_admin: 'warning',
  catalog_admin: 'pending',
  support_admin: 'suspended',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // General
  const [platformName, setPlatformName] = useState('PashuSevak');
  const [supportEmail, setSupportEmail] = useState('support@pashusevak.com');
  const [supportPhone, setSupportPhone] = useState('+91-98765-43210');
  const [generalSaved, setGeneralSaved] = useState(false);

  // Commission & Fees
  const [defaultCommission, setDefaultCommission] = useState(5);
  const [gwFee, setGwFee] = useState(2.5);
  const [perSellerOverride, setPerSellerOverride] = useState(false);
  const [commSaved, setCommSaved] = useState(false);

  // Tax Config
  const [gstOnComm, setGstOnComm] = useState(18);
  const [payoutCycle, setPayoutCycle] = useState('weekly');
  const [taxSaved, setTaxSaved] = useState(false);

  // Admin Users
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'ops_admin' });

  // Logistics Defaults
  const [defaultCourier, setDefaultCourier] = useState('delhivery');
  const [shippingMode, setShippingMode] = useState('easy_ship');
  const [pickupSLA, setPickupSLA] = useState(24);
  const [logisticsSaved, setLogisticsSaved] = useState(false);

  const handleSave = (setter, flag) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) return;
    setAdmins(prev => [...prev, {
      id: Date.now(),
      ...newAdmin,
      status: 'active',
      lastLogin: 'Never',
    }]);
    setNewAdmin({ name: '', email: '', password: '', role: 'ops_admin' });
    setShowAddAdmin(false);
  };

  const handleDeleteAdmin = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  // Logo Preview State & Handler
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'commission', label: 'Commission & Fees' },
    { key: 'tax', label: 'Tax Config' },
    { key: 'admins', label: 'Admin Users' },
    { key: 'logistics', label: 'Logistics Defaults' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure global platform behavior and defaults</p>
        </div>
        <Settings size={28} style={{ opacity: 0.5 }} />
      </div>

      {/* Tab Pills */}
      <div className="tabs-row" style={{ gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            style={{ padding: '10px 20px' }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="card" style={{ maxWidth: 600, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 className="section-title" style={{ marginBottom: 8 }}>General Settings</h3>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Platform Name</label>
            <input
              className="form-input"
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Support Email</label>
            <input
              type="email"
              className="form-input"
              value={supportEmail}
              onChange={e => setSupportEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="form-label">Support Phone</label>
            <input
              className="form-input"
              value={supportPhone}
              onChange={e => setSupportPhone(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
            <label className="form-label">Logo Upload</label>
            <input
              type="file"
              accept=".png,.svg"
              id="platform-logo-file"
              style={{ display: 'none' }}
              onChange={handleLogoChange}
            />
            <div
              onClick={() => document.getElementById('platform-logo-file').click()}
              style={{
                border: '2px dashed var(--gray-300)',
                borderRadius: 12,
                padding: '24px',
                textAlign: 'center',
                color: 'var(--gray-600)',
                cursor: 'pointer',
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'var(--gray-50)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--yellow-500)'; e.currentTarget.style.background = 'var(--yellow-50)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; }}
            >
              {logoPreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img src={logoPreview} alt="Logo preview" style={{ maxHeight: 60, objectFit: 'contain' }} />
                  <span style={{ fontSize: 11, color: 'var(--tile-green-dark)', fontWeight: 600 }}>✓ Logo loaded</span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 24 }}>📁</span>
                  <div>Click to upload logo (PNG, SVG)</div>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>File format must be PNG or SVG</span>
                </>
              )}
            </div>
          </div>
          {generalSaved && (
            <div className="audit-log-notice" style={{ marginBottom: '0.75rem' }}>
              <Check size={14} /> Changes saved
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleSave(setGeneralSaved)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
            Save Changes
          </button>
        </div>
      )}

      {/* Commission & Fees Tab */}
      {activeTab === 'commission' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 className="section-title">Commission &amp; Fees</h3>
          <div className="form-group">
            <label className="form-label">Default Commission Rate (%)</label>
            <input
              type="number"
              className="form-input"
              value={defaultCommission}
              onChange={e => setDefaultCommission(e.target.value)}
              min={0}
              max={50}
              step={0.5}
              style={{ width: 150 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Gateway Fee (%)</label>
            <input
              type="number"
              className="form-input"
              value={gwFee}
              onChange={e => setGwFee(e.target.value)}
              min={0}
              max={10}
              step={0.1}
              style={{ width: 150 }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={perSellerOverride}
                onChange={e => setPerSellerOverride(e.target.checked)}
              />
              Enable per-seller commission override
            </label>
          </div>
          <div
            className="formula-banner card"
            style={{ marginBottom: '1rem', fontSize: '0.85rem' }}
          >
            ⚠️ Note: Changes apply to new orders only
          </div>
          {commSaved && (
            <div className="audit-log-notice" style={{ marginBottom: '0.75rem' }}>
              <Check size={14} /> Settings saved
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleSave(setCommSaved)}>Save</button>
        </div>
      )}

      {/* Tax Config Tab */}
      {activeTab === 'tax' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 className="section-title">Tax Configuration</h3>
          <div className="form-group">
            <label className="form-label">GST on Commission (%)</label>
            <input
              type="number"
              className="form-input"
              value={gstOnComm}
              onChange={e => setGstOnComm(e.target.value)}
              min={0}
              max={28}
              step={1}
              style={{ width: 150 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payout Cycle</label>
            <select
              className="form-select"
              value={payoutCycle}
              onChange={e => setPayoutCycle(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          {taxSaved && (
            <div className="audit-log-notice" style={{ marginBottom: '0.75rem' }}>
              <Check size={14} /> Tax config saved
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleSave(setTaxSaved)}>Save</button>
        </div>
      )}

      {/* Admin Users Tab */}
      {activeTab === 'admins' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Admin Users</h3>
            <button className="btn btn-primary" onClick={() => setShowAddAdmin(true)}>
              <Plus size={16} /> Add Admin
            </button>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td><strong>{admin.name}</strong></td>
                    <td>{admin.email}</td>
                    <td>
                      <span className={`status-badge ${ROLE_COLORS[admin.role] || 'active'}`}>
                        {(admin.role || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${admin.status}`}>{admin.status}</span>
                    </td>
                    <td>{admin.lastLogin}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost" title="Edit"><Edit size={15} /></button>
                        <button
                          className="btn btn-danger"
                          title="Delete"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Admin Modal */}
          {showAddAdmin && (
            <div className="modal-overlay" onClick={() => setShowAddAdmin(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Add Admin User</h3>
                  <button className="btn btn-ghost" onClick={() => setShowAddAdmin(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      value={newAdmin.name}
                      onChange={e => setNewAdmin(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Verma"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newAdmin.email}
                      onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                      placeholder="admin@pashusevak.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newAdmin.password}
                      onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                      placeholder="Set temporary password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={newAdmin.role}
                      onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="ops_admin">Ops Admin</option>
                      <option value="finance_admin">Finance Admin</option>
                      <option value="catalog_admin">Catalog Admin</option>
                      <option value="support_admin">Support Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" onClick={() => setShowAddAdmin(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleAddAdmin}>
                    <Plus size={14} /> Add Admin
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logistics Defaults Tab */}
      {activeTab === 'logistics' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 className="section-title">Logistics Defaults</h3>
          <div className="form-group">
            <label className="form-label">Default Courier</label>
            <select
              className="form-select"
              value={defaultCourier}
              onChange={e => setDefaultCourier(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="delhivery">Delhivery</option>
              <option value="bluedart">BlueDart</option>
              <option value="dtdc">DTDC</option>
              <option value="xpressbees">Xpressbees</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Shipping Mode</label>
            <select
              className="form-select"
              value={shippingMode}
              onChange={e => setShippingMode(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="easy_ship">Easy Ship</option>
              <option value="self_ship">Self Ship</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Pickup SLA (hours)</label>
            <input
              type="number"
              className="form-input"
              value={pickupSLA}
              onChange={e => setPickupSLA(e.target.value)}
              min={1}
              max={72}
              style={{ width: 150 }}
            />
          </div>
          {logisticsSaved && (
            <div className="audit-log-notice" style={{ marginBottom: '0.75rem' }}>
              <Check size={14} /> Logistics defaults saved
            </div>
          )}
          <button className="btn btn-primary" onClick={() => handleSave(setLogisticsSaved)}>Save</button>
        </div>
      )}
    </div>
  );
}
