import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Truck, CreditCard,
  BarChart3, FolderOpen, Bell, Settings, ChevronLeft, ChevronRight,
  Search, LogOut, User, Menu, AlertCircle, X, ChevronDown
} from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

const NAV = [
  { section: 'Overview', items: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  ]},
  { section: 'Operations', items: [
    { to: '/admin/sellers', icon: Users, label: 'Sellers', badge: 2 },
    { to: '/admin/products', icon: Package, label: 'Products', badge: 2 },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders', badge: 8 },
    { to: '/admin/logistics', icon: Truck, label: 'Logistics', badge: null },
  ]},
  { section: 'Finance', items: [
    { to: '/admin/payments', icon: CreditCard, label: 'Payments', badge: 3 },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports', badge: null },
  ]},
  { section: 'Platform', items: [
    { to: '/admin/documents', icon: FolderOpen, label: 'Documents', badge: null },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: 3 },
    { to: '/admin/settings', icon: Settings, label: 'Settings', badge: null },
  ]},
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  ops_admin: 'Ops Admin',
  finance_admin: 'Finance Admin',
  catalog_admin: 'Catalog Admin',
  support_admin: 'Support Admin',
};

const BREADCRUMB_MAP = {
  '/admin': 'Dashboard',
  '/admin/sellers': 'Seller Management',
  '/admin/products': 'Product Management',
  '/admin/orders': 'Order Management',
  '/admin/logistics': 'Logistics',
  '/admin/payments': 'Payments & Payouts',
  '/admin/reports': 'Reports & Analytics',
  '/admin/documents': 'Documents',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
};

export default function AdminShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);

  const unread = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentPage = BREADCRUMB_MAP[location.pathname] || 'Admin Portal';
  const initials = admin?.name?.split(' ').map(w => w[0]).join('').toUpperCase() || 'SA';

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🐄</div>
          {!collapsed && (
            <div className="sidebar-logo-text">
              <span className="brand">PashuSevak</span>
              <span className="sub">Admin Portal</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {NAV.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="nav-icon" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', color: 'var(--sidebar-text)' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            <LogOut className="nav-icon" size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse button (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: 20, right: -12,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--yellow-500)', border: '2px solid #1A1A0E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 101,
          }}
        >
          {collapsed ? <ChevronRight size={12} color="#1A1A0E" /> : <ChevronLeft size={12} color="#1A1A0E" />}
        </button>
      </aside>

      {/* Main */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={18} />
          </button>

          <div className="topbar-breadcrumb">
            <span>Admin Portal</span>
            <span className="sep">/</span>
            <span className="current">{currentPage}</span>
          </div>

          <div className="topbar-right" ref={notifRef}>
            <div className="topbar-search">
              <Search size={14} color="var(--gray-400)" />
              <input placeholder="Search orders, sellers..." />
            </div>

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                <Bell size={18} />
                {unread > 0 && <span className="badge">{unread}</span>}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', top: 44, right: 0,
                  width: 340, background: '#fff', borderRadius: 12,
                  boxShadow: 'var(--shadow-xl)', border: '1px solid var(--gray-200)',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                    <span style={{ fontSize: 11, color: 'var(--yellow-700)', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {MOCK_NOTIFICATIONS.map(n => (
                      <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-50)', background: n.isRead ? '#fff' : 'var(--yellow-50)', display: 'flex', gap: 10, cursor: 'pointer' }} onClick={() => setNotifOpen(false)}>
                        <div style={{ fontSize: 18, flexShrink: 0 }}>
                          {n.type === 'seller_signup' ? '🏪' : n.type === 'kyc_pending' ? '📄' : n.type === 'low_stock' ? '⚠️' : n.type === 'payout_failed' ? '💸' : '🚚'}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-900)' }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                        </div>
                        {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow-500)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid var(--gray-100)' }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { navigate('/notifications'); setNotifOpen(false); }}>View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
                <div className="admin-avatar">{initials}</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>{admin?.name}</span>
                  <span className="role-badge" style={{ marginTop: 3 }}>{ROLE_LABELS[admin?.role]}</span>
                </div>
                <ChevronDown size={14} color="var(--gray-500)" />
              </div>

              {profileOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 200, background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--gray-200)', zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{admin?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{admin?.email}</div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <button className="nav-item" style={{ width: '100%', border: 'none', background: 'none', color: 'var(--gray-700)', padding: '8px 16px' }}>
                      <User size={14} /> My Profile
                    </button>
                    <button className="nav-item" style={{ width: '100%', border: 'none', background: 'none', color: '#B71C1C', padding: '8px 16px' }} onClick={() => { logout(); navigate('/login'); }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
