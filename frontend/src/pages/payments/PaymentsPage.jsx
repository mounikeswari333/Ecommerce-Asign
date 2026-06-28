import { useState } from 'react';
import {
  Download, Check, X, CreditCard,
  AlertTriangle, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { MOCK_PAYMENTS, MOCK_PAYOUT_BATCHES, MOCK_SELLERS } from '../../data/mockData';

const FORMULA_NOTE = 'Net Payout = Gross Sale − Platform Commission (5%) − Payment Gateway Fee (2.5%) − Logistics Cost − Taxes + Adjustments';

function calcNet(gross) {
  const comm = gross * 0.05;
  const gw = gross * 0.025;
  const logistics = 50;
  const tax = comm * 0.18;
  return Math.max(0, gross - comm - gw - logistics - tax).toFixed(2);
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('batches');
  const [showReleaseModal, setShowReleaseModal] = useState(null);
  const [releaseConfirmed, setReleaseConfirmed] = useState({});
  const [expandedLedger, setExpandedLedger] = useState(null);

  const pendingPayouts = (MOCK_PAYOUT_BATCHES || []).filter(b => b.status === 'scheduled').length;
  const processingBatches = (MOCK_PAYOUT_BATCHES || []).filter(b => b.status === 'processing').length;
  const settledAmt = (MOCK_PAYOUT_BATCHES || [])
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.netPayout || 0), 0);
  const failedPayouts = (MOCK_PAYMENTS || []).filter(p => p.payoutStatus === 'failed' || p.payoutStatus === 'on_hold').length;

  const tabs = [
    { key: 'batches', label: 'Payout Batches' },
    { key: 'ledger', label: 'Transaction Ledger' },
    { key: 'failed', label: 'Failed Payouts' },
    { key: 'tax', label: 'Tax Reports' },
  ];

  const handleRelease = (batchId) => {
    setReleaseConfirmed(prev => ({ ...prev, [batchId]: true }));
    setShowReleaseModal(null);
  };

  const totalCommission = (MOCK_PAYMENTS || []).reduce((s, p) => s + (p.grossSale || 0) * 0.05, 0);
  const gstOnComm = totalCommission * 0.18;
  const netPlatformRev = totalCommission - gstOnComm;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments &amp; Payouts</h1>
          <p className="page-subtitle">Manage seller settlements and financial transactions</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-tile amber">
          <div className="kpi-icon"><AlertTriangle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{pendingPayouts}</div>
            <div className="kpi-label">Pending Payouts</div>
          </div>
        </div>
        <div className="kpi-tile blue">
          <div className="kpi-icon"><RefreshCw size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{processingBatches}</div>
            <div className="kpi-label">Processing Batches</div>
          </div>
        </div>
        <div className="kpi-tile green">
          <div className="kpi-icon"><CheckCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">₹{settledAmt.toLocaleString()}</div>
            <div className="kpi-label">Settled This Month</div>
          </div>
        </div>
        <div className="kpi-tile red">
          <div className="kpi-icon"><XCircle size={22} /></div>
          <div className="kpi-body">
            <div className="kpi-value">{failedPayouts}</div>
            <div className="kpi-label">Failed Payouts</div>
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
            {t.label}
          </button>
        ))}
      </div>

      {/* Payout Batches Tab */}
      {activeTab === 'batches' && (
        <div>
          <div className="formula-banner card">
            <CreditCard size={18} />
            <span>{FORMULA_NOTE}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary">Bulk Release All</button>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Seller</th>
                  <th>Period</th>
                  <th>Orders</th>
                  <th>Gross (₹)</th>
                  <th>Net Payout (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(MOCK_PAYOUT_BATCHES || []).map(batch => (
                  <tr key={batch.batchId}>
                    <td><span className="mono">{batch.batchId}</span></td>
                    <td>{batch.sellerName}</td>
                    <td>{batch.period}</td>
                    <td>{batch.totalOrders}</td>
                    <td>₹{(batch.grossAmount || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--color-success, #22c55e)', fontWeight: 600 }}>
                      ₹{(batch.netPayout || calcNet(batch.grossAmount || 0)).toLocaleString()}
                    </td>
                    <td><span className={`status-badge ${batch.status}`}>{batch.status}</span></td>
                    <td>
                      <div className="action-btns">
                        {batch.status === 'scheduled' && !releaseConfirmed[batch.batchId] && (
                          <button
                            className="btn btn-primary"
                            onClick={() => setShowReleaseModal(batch)}
                          >
                            Release Payout
                          </button>
                        )}
                        {releaseConfirmed[batch.batchId] && (
                          <span className="pickup-scheduled">
                            <CheckCircle size={14} /> Released
                          </span>
                        )}
                        {batch.status === 'completed' && (
                          <span className="info-value" style={{ fontSize: '0.8rem' }}>
                            UTR: {batch.utr || 'N/A'}
                          </span>
                        )}
                        {batch.status === 'processing' && (
                          <span className="status-badge processing">Processing...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!MOCK_PAYOUT_BATCHES || MOCK_PAYOUT_BATCHES.length === 0) && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No payout batches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Ledger Tab */}
      {activeTab === 'ledger' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-outline"><Download size={16} /> Export CSV</button>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order Ref</th>
                  <th>Seller</th>
                  <th>Gross (₹)</th>
                  <th style={{ color: 'var(--color-danger, #ef4444)' }}>Comm 5%</th>
                  <th style={{ color: 'var(--color-danger, #ef4444)' }}>GW 2.5%</th>
                  <th style={{ color: 'var(--color-danger, #ef4444)' }}>Logistics</th>
                  <th style={{ color: 'var(--color-danger, #ef4444)' }}>Tax</th>
                  <th>Adj</th>
                  <th style={{ color: 'var(--color-success, #22c55e)' }}>Net (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(MOCK_PAYMENTS || []).map(p => {
                  const gross = p.grossSale || 0;
                  const comm = (gross * 0.05).toFixed(2);
                  const gw = (gross * 0.025).toFixed(2);
                  const logistics = p.logisticsCost || 50;
                  const tax = (gross * 0.05 * 0.18).toFixed(2);
                  const net = calcNet(gross);
                  const isExpanded = expandedLedger === p.paymentId;
                  return (
                    <>
                      <tr key={p.paymentId} style={{ cursor: 'pointer' }} onClick={() => setExpandedLedger(isExpanded ? null : p.paymentId)}>
                        <td><span className="mono">{p.paymentId}</span></td>
                        <td><span className="mono">{p.orderRef || p.orderId}</span></td>
                        <td>{p.sellerName}</td>
                        <td>₹{gross.toLocaleString()}</td>
                        <td style={{ color: 'var(--color-danger, #ef4444)' }}>-₹{comm}</td>
                        <td style={{ color: 'var(--color-danger, #ef4444)' }}>-₹{gw}</td>
                        <td style={{ color: 'var(--color-danger, #ef4444)' }}>-₹{logistics}</td>
                        <td style={{ color: 'var(--color-danger, #ef4444)' }}>-₹{tax}</td>
                        <td>₹{p.adjustments || 0}</td>
                        <td style={{ color: 'var(--color-success, #22c55e)', fontWeight: 600 }}>₹{net}</td>
                        <td><span className={`status-badge ${p.payoutStatus || p.status}`}>{p.payoutStatus || p.status}</span></td>
                      </tr>
                      {isExpanded && (
                        <tr style={{ background: 'var(--gray-50)' }}>
                          <td colSpan={11} style={{ padding: '12px 24px' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, flexWrap: 'wrap' }}>
                              <span><strong>Gross Sale:</strong> ₹{gross}</span>
                              <span>➜</span>
                              <span style={{ color: '#C62828' }}><strong>Commission (5%):</strong> -₹{comm}</span>
                              <span>➜</span>
                              <span style={{ color: '#C62828' }}><strong>Gateway Fee (2.5%):</strong> -₹{gw}</span>
                              <span>➜</span>
                              <span style={{ color: '#C62828' }}><strong>Logistics:</strong> -₹{logistics}</span>
                              <span>➜</span>
                              <span style={{ color: '#C62828' }}><strong>GST Tax:</strong> -₹{tax}</span>
                              <span>➜</span>
                              <span><strong>Adjustment:</strong> ₹{p.adjustments || 0}</span>
                              <span>➜</span>
                              <span style={{ color: '#2E7D32', fontSize: 13 }}><strong>Net Payout:</strong> ₹{net}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
                {(!MOCK_PAYMENTS || MOCK_PAYMENTS.length === 0) && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed Payouts Tab */}
      {activeTab === 'failed' && (
        <div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Seller</th>
                  <th>Amount (₹)</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(MOCK_PAYMENTS || [])
                  .filter(p => p.payoutStatus === 'failed' || p.payoutStatus === 'on_hold')
                  .map(p => (
                    <tr key={p.paymentId}>
                      <td><span className="mono">{p.paymentId}</span></td>
                      <td>{p.sellerName}</td>
                      <td>₹{(p.netPayout || p.grossSale || 0).toLocaleString()}</td>
                      <td>{p.failReason || p.holdReason || 'Bank account mismatch'}</td>
                      <td><span className={`status-badge ${p.payoutStatus}`}>{p.payoutStatus}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-primary"><RefreshCw size={14} /> Retry</button>
                          {p.payoutStatus === 'on_hold' && (
                            <button className="btn btn-success"><Check size={14} /> Release Hold</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {(MOCK_PAYMENTS || []).filter(p => p.payoutStatus === 'failed' || p.payoutStatus === 'on_hold').length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No failed payouts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tax Reports Tab */}
      {activeTab === 'tax' && (
        <div>
          <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="kpi-tile blue">
              <div className="kpi-body">
                <div className="kpi-value">₹{totalCommission.toFixed(0)}</div>
                <div className="kpi-label">Total Commission Earned</div>
              </div>
            </div>
            <div className="kpi-tile amber">
              <div className="kpi-body">
                <div className="kpi-value">₹{gstOnComm.toFixed(0)}</div>
                <div className="kpi-label">GST on Commission (18%)</div>
              </div>
            </div>
            <div className="kpi-tile green">
              <div className="kpi-body">
                <div className="kpi-value">₹{netPlatformRev.toFixed(0)}</div>
                <div className="kpi-label">Net Platform Revenue</div>
              </div>
            </div>
          </div>
          <div className="table-card">
            <h4 style={{ padding: '1rem 1rem 0.5rem', margin: 0 }}>Monthly Breakdown</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Gross Sales (₹)</th>
                  <th>Commission (₹)</th>
                  <th>GST (₹)</th>
                  <th>Net Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const g = (Math.random() * 50000 + 10000).toFixed(0);
                  const c = (g * 0.05).toFixed(0);
                  const gst = (c * 0.18).toFixed(0);
                  const net = (c - gst).toFixed(0);
                  return (
                    <tr key={month}>
                      <td>{month} 2024</td>
                      <td>₹{Number(g).toLocaleString()}</td>
                      <td>₹{Number(c).toLocaleString()}</td>
                      <td>₹{Number(gst).toLocaleString()}</td>
                      <td style={{ color: 'var(--color-success, #22c55e)', fontWeight: 600 }}>₹{Number(net).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Release Payout Modal */}
      {showReleaseModal && (
        <div className="modal-overlay" onClick={() => setShowReleaseModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Release Payout — {showReleaseModal.batchId}</h3>
              <button className="btn btn-ghost" onClick={() => setShowReleaseModal(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p>Confirm release of payout for <strong>{showReleaseModal.sellerName}</strong>?</p>
              <div className="payment-breakdown">
                <div className="payment-row"><span>Gross Amount</span><span>₹{(showReleaseModal.grossAmount || 0).toLocaleString()}</span></div>
                <div className="payment-row deduction"><span>Commission (5%)</span><span>-₹{((showReleaseModal.grossAmount || 0) * 0.05).toFixed(2)}</span></div>
                <div className="payment-row deduction"><span>Gateway Fee (2.5%)</span><span>-₹{((showReleaseModal.grossAmount || 0) * 0.025).toFixed(2)}</span></div>
                <div className="payment-row deduction"><span>Logistics</span><span>-₹50.00</span></div>
                <div className="payment-row" style={{ fontWeight: 700, borderTop: '1px solid var(--border-color)' }}>
                  <span>Net Payout</span>
                  <span style={{ color: 'var(--color-success, #22c55e)' }}>
                    ₹{calcNet(showReleaseModal.grossAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReleaseModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={() => handleRelease(showReleaseModal.batchId)}>
                <Check size={14} /> Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
