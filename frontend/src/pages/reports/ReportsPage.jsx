import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { MOCK_SELLERS, MOCK_PRODUCTS, MOCK_PAYOUT_BATCHES } from '../../data/mockData';

const SALES_DATA = [
  { category:'Milk', sales:145000, orders:312, avg:465 },
  { category:'Ghee', sales:215000, orders:198, avg:1085 },
  { category:'Paneer', sales:89000, orders:245, avg:363 },
  { category:'Cattle Feed', sales:184500, orders:142, avg:1300 },
  { category:'Equipment', sales:62500, orders:28, avg:2232 },
];

export default function ReportsPage() {
  const [tab, setTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Reports & Analytics</div><div className="page-subtitle">Business intelligence across all sellers and categories</div></div>
        <div className="page-actions">
          <input type="date" className="filter-select" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <span style={{color:'var(--gray-400)',fontSize:12}}>to</span>
          <input type="date" className="filter-select" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          <button className="btn btn-success btn-sm"><Download size={14}/> Export CSV</button>
          <button className="btn btn-outline btn-sm"><Download size={14}/> Export PDF</button>
        </div>
      </div>

      <div className="card">
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--gray-100)'}}>
          <div className="tab-group">
            {['sales','performance','inventory','settlement'].map(t=>(
              <button key={t} className={`tab-pill ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
                {t==='sales'?'📊 Sales Report':t==='performance'?'🏆 Seller Performance':t==='inventory'?'📦 Inventory':'💸 Settlement'}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {tab === 'sales' && (
            <div>
              <div style={{marginBottom:24}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Revenue by Category</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={SALES_DATA} margin={{top:5,right:10,bottom:5,left:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                    <XAxis dataKey="category" tick={{fontSize:11,fill:'var(--gray-600)'}}/>
                    <YAxis tick={{fontSize:10,fill:'var(--gray-500)'}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
                    <Tooltip formatter={(v,n)=>[`₹${v.toLocaleString('en-IN')}`,n]}/>
                    <Bar dataKey="sales" name="Sales" fill="#F5C518" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <table className="data-table">
                <thead><tr><th>Category</th><th className="text-right">Total Sales</th><th className="text-right">Orders</th><th className="text-right">Avg Order Value</th><th className="text-right">Growth</th></tr></thead>
                <tbody>
                  {SALES_DATA.map(r=>(
                    <tr key={r.category}>
                      <td style={{fontWeight:600}}>{r.category}</td>
                      <td className="text-right" style={{fontWeight:700,color:'#2E7D32'}}>₹{r.sales.toLocaleString('en-IN')}</td>
                      <td className="text-right">{r.orders}</td>
                      <td className="text-right">₹{r.avg.toLocaleString('en-IN')}</td>
                      <td className="text-right" style={{color:'#2E7D32',fontWeight:700}}>+{(5+Math.random()*20).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'performance' && (
            <div>
              <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><button className="btn btn-outline btn-sm"><Download size={13}/> Export</button></div>
              <table className="data-table">
                <thead><tr><th>Seller</th><th>Seller ID</th><th className="text-right">Total Orders</th><th>Fulfillment Rate</th><th>Return Rate</th><th>Avg Rating</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_SELLERS.filter(s=>s.totalOrders>0).map(s=>(
                    <tr key={s._id}>
                      <td style={{fontWeight:600}}>{s.businessName}</td>
                      <td className="font-mono" style={{fontSize:11,color:'var(--gray-500)'}}>{s.sellerId}</td>
                      <td className="text-right">{s.totalOrders.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{flex:1,height:6,background:'var(--gray-100)',borderRadius:3}}>
                            <div style={{height:'100%',width:`${s.performanceScore.fulfillmentRate}%`,background:s.performanceScore.fulfillmentRate>=90?'#2E7D32':s.performanceScore.fulfillmentRate>=75?'#E65100':'#B71C1C',borderRadius:3}}/>
                          </div>
                          <span style={{fontWeight:700,color:s.performanceScore.fulfillmentRate>=90?'#2E7D32':s.performanceScore.fulfillmentRate>=75?'#E65100':'#B71C1C',fontSize:12,minWidth:36}}>
                            {s.performanceScore.fulfillmentRate}%
                          </span>
                        </div>
                      </td>
                      <td style={{color:s.performanceScore.returnRate<=3?'#2E7D32':s.performanceScore.returnRate<=7?'#E65100':'#B71C1C',fontWeight:700}}>
                        {s.performanceScore.returnRate}%
                      </td>
                      <td>{'⭐'.repeat(Math.round(s.performanceScore.avgRating||0))} {s.performanceScore.avgRating||'N/A'}</td>
                      <td><span className={`status-badge ${s.status}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'inventory' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12,alignItems:'center'}}>
                <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer'}}>
                  <input type="checkbox" checked={lowStockOnly} onChange={e=>setLowStockOnly(e.target.checked)} style={{accentColor:'var(--yellow-600)'}}/>
                  Show low stock only ({"<"}10 units)
                </label>
                <button className="btn btn-outline btn-sm"><Download size={13}/> Export</button>
              </div>
              <table className="data-table">
                <thead><tr><th>Product</th><th>Seller</th><th>Category</th><th className="text-right">Stock</th><th>Unit</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_PRODUCTS.filter(p=>!lowStockOnly||(p.stock<10)).map(p=>(
                    <tr key={p._id} style={{background:p.stock<10?'#FFF8E1':''}}>
                      <td style={{fontWeight:600,fontSize:13}}>{p.name}</td>
                      <td style={{fontSize:12}}>{p.sellerName}</td>
                      <td>{p.category}</td>
                      <td className="text-right">
                        <span style={{fontWeight:700,color:p.stock<10?'#B71C1C':p.stock<30?'#E65100':'#2E7D32'}}>
                          {p.stock} {p.stock<10&&'⚠️'}
                        </span>
                      </td>
                      <td>{p.unit}</td>
                      <td><span className={`status-badge ${p.status}`}>{p.status.replace(/_/g,' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'settlement' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                {[{l:'Total Gross',v:'₹5,48,300',c:'brown'},{l:'Total Commission',v:'₹27,415',c:'green'},{l:'Total Net Payouts',v:'₹4,68,450',c:'blue'},{l:'Platform Revenue',v:'₹22,480',c:'purple'}].map(c=>(
                  <div key={c.l} className={`kpi-tile ${c.c}`}><div className="kpi-tile-value" style={{fontSize:18}}>{c.v}</div><div className="kpi-tile-label">{c.l}</div></div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}><button className="btn btn-outline btn-sm"><Download size={13}/> Export CSV</button></div>
              <table className="data-table">
                <thead><tr><th>Batch ID</th><th>Seller</th><th>Period</th><th className="text-right">Orders</th><th className="text-right">Gross</th><th className="text-right">Net Payout</th><th>Status</th></tr></thead>
                <tbody>
                  {MOCK_PAYOUT_BATCHES.map(b=>(
                    <tr key={b._id}>
                      <td className="font-mono" style={{fontSize:11}}>{b.batchId}</td>
                      <td style={{fontWeight:600}}>{b.sellerName}</td>
                      <td style={{fontSize:11,color:'var(--gray-500)'}}>{new Date(b.periodStart).toLocaleDateString('en-IN')} – {new Date(b.periodEnd).toLocaleDateString('en-IN')}</td>
                      <td className="text-right">{b.totalOrders}</td>
                      <td className="text-right" style={{fontWeight:700}}>₹{b.totalGross.toLocaleString('en-IN')}</td>
                      <td className="text-right" style={{fontWeight:800,color:'#2E7D32'}}>₹{b.totalNetPayout.toLocaleString('en-IN')}</td>
                      <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
