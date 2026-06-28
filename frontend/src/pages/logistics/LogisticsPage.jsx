import { useState } from 'react';
import {
  Truck, Package, Check, X, Plus, Edit, RefreshCw,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { MOCK_ORDERS } from '../../data/mockData';

const COURIER_PARTNERS = [
  { id: 'delhivery', name: 'Delhivery', active: true, cod: true, avgDays: 3, states: ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat'] },
  { id: 'bluedart', name: 'BlueDart', active: true, cod: false, avgDays: 2, states: ['Maharashtra', 'Delhi', 'Karnataka'] },
  { id: 'dtdc', name: 'DTDC', active: true, cod: true, avgDays: 4, states: ['Maharashtra', 'Delhi', 'Karnataka', 'Rajasthan', 'UP'] },
  { id: 'xpressbees', name: 'Xpressbees', active: false, cod: true, avgDays: 4, states: ['Maharashtra', 'Gujarat', 'Rajasthan'] },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'UP', 'Uttarakhand', 'West Bengal',
];

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState('couriers');
  const [couriers, setCouriers] = useState(COURIER_PARTNERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourier, setNewCourier] = useState({ name: '', apiKey: '', cod: false, states: [] });
  const [scheduledOrders, setScheduledOrders] = useState({});
  const [awbInput, setAwbInput] = useState('');
  const [awbResults, setAwbResults] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const handleToggleCourier = (id) => {
    setCouriers(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleSchedulePickup = (orderId) => {
    setScheduledOrders(prev => ({ ...prev, [orderId]: true }));
  };

  const handleSyncAWB = () => {
    setSyncing(true);
    setTimeout(() => {
      const lines = awbInput.split('\n').filter(l => l.trim());
      setAwbResults(lines.map(awb => ({
        awb: awb.trim(),
        orderId: 'ORD-' + Math.floor(Math.random() * 10000),
        courier: 'Delhivery',
        lastStatus: 'In Transit',
        updatedAt: new Date().toLocaleString(),
      })));
      setSyncing(false);
    }, 2000);
  };

  const handleAddState = (state) => {
    setNewCourier(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  };

  const easyShipOrders = MOCK_ORDERS.filter(o => o.shippingMode === 'easy_ship').length;
  const selfShipOrders = MOCK_ORDERS.filter(o => o.shippingMode === 'self_ship').length;
  const packedOrders = MOCK_ORDERS.filter(o => o.status === 'packed');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Logistics Management</h1>
          <p className="page-subtitle">Manage courier partners, pickups, and shipments</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-tile green">
          <div className="kpi-icon"><Truck size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{couriers.filter(c => c.active).length}</div>
            <div className="kpi-label">Active Partners</div>
          </div>
        </div>
        <div className="kpi-tile amber">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{packedOrders.length}</div>
            <div className="kpi-label">Pending Pickups</div>
          </div>
        </div>
        <div className="kpi-tile blue">
          <div className="kpi-icon"><Package size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{easyShipOrders}</div>
            <div className="kpi-label">Easy Ship Orders</div>
          </div>
        </div>
        <div className="kpi-tile purple">
          <div className="kpi-icon"><Package size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{selfShipOrders}</div>
            <div className="kpi-label">Self Ship Orders</div>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="tabs-row">
        {[
          { key: 'couriers', label: 'Courier Partners' },
          { key: 'pickup', label: 'Pickup Scheduler' },
          { key: 'awb', label: 'AWB Tracking' },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-pill ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Courier Partners Tab */}
      {activeTab === 'couriers' && (
        <div>
          {/* Shipping Modes */}
          <div className="shipping-modes">
            <div className="shipping-card easy-ship">
              <div className="shipping-card-header">
                <Truck size={20} />
                <strong>Easy Ship</strong>
                <span className="badge-recommended">Recommended</span>
              </div>
              <ul className="shipping-features">
                <li>✓ Courier partners: Delhivery, BlueDart, DTDC</li>
                <li>✓ Auto-generated AWB &amp; shipping label</li>
                <li>✓ Pickup scheduled within 24 hours</li>
                <li>✓ Logistics fee deducted from settlement</li>
              </ul>
            </div>
            <div className="shipping-card self-ship">
              <div className="shipping-card-header">
                <Package size={20} />
                <strong>Self Ship</strong>
              </div>
              <ul className="shipping-features">
                <li>You arrange delivery using your own courier</li>
                <li>Manual AWB entry required</li>
                <li>Full control over logistics</li>
                <li>No logistics fee deducted</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Courier Partners</h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Courier Partner
            </button>
          </div>

          <div className="courier-cards" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {couriers.map(courier => (
              <div 
                key={courier.id} 
                className="card" 
                style={{ 
                  padding: 24, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 16,
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{courier.name}</h4>
                    {courier.cod && (
                      <span className="status-badge placed" style={{ padding: '3px 8px', fontSize: 11 }}>
                        COD Available
                      </span>
                    )}
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={courier.active}
                      onChange={() => handleToggleCourier(courier.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--gray-700)' }}>
                  <span>Avg Delivery: <strong>{courier.avgDays} days</strong></span>
                  <span 
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: 12, 
                      fontSize: 11, 
                      fontWeight: 700,
                      background: courier.active ? '#2E7D32' : '#C62828',
                      color: '#fff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {courier.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {courier.states.map(s => (
                    <span 
                      key={s} 
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        background: 'var(--gray-100)', 
                        color: 'var(--gray-800)', 
                        fontSize: 12,
                        border: '1px solid var(--gray-200)'
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
                  <Edit size={14} /> Edit Partner
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pickup Scheduler Tab */}
      {activeTab === 'pickup' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 className="section-title">Pickup Scheduler</h3>
            <p className="page-subtitle">✓ Pickup scheduled within 24 hours</p>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Seller</th>
                  <th>Items</th>
                  <th>City</th>
                  <th>Courier Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.slice(0, 8).map(order => (
                  <tr key={order.orderId}>
                    <td><span className="mono">{order.orderId}</span></td>
                    <td>{order.sellerName}</td>
                    <td>{(order.items || []).length} item(s)</td>
                    <td>{order.deliveryCity || 'Mumbai'}</td>
                    <td>{order.courierName || 'Delhivery'}</td>
                    <td>
                      {scheduledOrders[order.orderId] ? (
                        <span className="pickup-scheduled">
                          <CheckCircle size={14} /> AWB generated: DL1234XXXX
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSchedulePickup(order.orderId)}
                        >
                          <Truck size={14} /> Schedule Pickup
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {MOCK_ORDERS.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No orders pending pickup.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AWB Tracking Tab */}
      {activeTab === 'awb' && (
        <div>
          <h3 className="section-title">AWB Tracking</h3>
          <div className="awb-input-section card">
            <label className="form-label">Paste AWB Numbers (one per line)</label>
            <textarea
              className="form-input"
              rows={5}
              placeholder={'DL1234567890\nBD9876543210\n...'}
              value={awbInput}
              onChange={e => setAwbInput(e.target.value)}
              style={{ width: '100%', resize: 'vertical', marginBottom: '1rem' }}
            />
            <button className="btn btn-primary" onClick={handleSyncAWB} disabled={syncing}>
              {syncing
                ? <><RefreshCw size={15} className="spin" /> Syncing...</>
                : <><RefreshCw size={15} /> Sync Status</>
              }
            </button>
          </div>
          {awbResults.length > 0 && (
            <div className="table-card" style={{ marginTop: '1.5rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>AWB</th>
                    <th>Order ID</th>
                    <th>Courier</th>
                    <th>Last Status</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {awbResults.map((r, i) => (
                    <tr key={i}>
                      <td><span className="mono">{r.awb}</span></td>
                      <td>{r.orderId}</td>
                      <td>{r.courier}</td>
                      <td><span className="status-badge in_transit">{r.lastStatus}</span></td>
                      <td>{r.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Courier Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>Add Courier Partner</h3>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Courier Name</label>
                <input
                  className="form-input"
                  value={newCourier.name}
                  onChange={e => setNewCourier(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. FedEx"
                />
              </div>
              <div className="form-group">
                <label className="form-label">API Key</label>
                <input
                  className="form-input"
                  type="password"
                  value={newCourier.apiKey}
                  onChange={e => setNewCourier(p => ({ ...p, apiKey: e.target.value }))}
                  placeholder="Enter API key"
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newCourier.cod}
                    onChange={e => setNewCourier(p => ({ ...p, cod: e.target.checked }))}
                  />
                  COD Available
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Serviceable States</label>
                <div className="states-checkboxes">
                  {INDIAN_STATES.map(s => (
                    <label key={s} className="state-checkbox">
                      <input
                        type="checkbox"
                        checked={newCourier.states.includes(s)}
                        onChange={() => handleAddState(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary"><Check size={14} /> Add Partner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
