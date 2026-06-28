import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminShell from './layouts/AdminShell';
import Login from './pages/Login';
import SellerRegister from './pages/SellerRegister';
import Dashboard from './pages/Dashboard';

import { Suspense, lazy } from 'react';

// Lazy-load Admin module pages
const SellerList = lazy(() => import('./pages/sellers/SellerList'));
const SellerProfile = lazy(() => import('./pages/sellers/SellerProfile'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const OrderList = lazy(() => import('./pages/orders/OrderList'));
const LogisticsPage = lazy(() => import('./pages/logistics/LogisticsPage'));
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const DocumentsPage = lazy(() => import('./pages/documents/DocumentsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));

// Lazy-load Buyer storefront pages
const Storefront = lazy(() => import('./pages/buyer/Storefront'));
const ProductDetail = lazy(() => import('./pages/buyer/ProductDetail'));
const Cart = lazy(() => import('./pages/buyer/Cart'));
const Checkout = lazy(() => import('./pages/buyer/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/buyer/OrderConfirmation'));
const MyOrders = lazy(() => import('./pages/buyer/MyOrders'));
const TrackOrder = lazy(() => import('./pages/buyer/TrackOrder'));
const BuyerLogin = lazy(() => import('./pages/buyer/BuyerLogin'));
const BuyerRegister = lazy(() => import('./pages/buyer/BuyerRegister'));

// Lazy-load Seller portal pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'));
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'));
const SellerPayments = lazy(() => import('./pages/seller/SellerPayments'));
const SellerLogin = lazy(() => import('./pages/seller/SellerLogin'));
const SellerProfilePage = lazy(() => import('./pages/seller/SellerProfile'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid var(--yellow-200)', borderTopColor: 'var(--yellow-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 14, color: 'var(--gray-500)', fontWeight: 500 }}>Loading module...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Route Guard for Admin Portal
function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <PageLoader />;
  // Check if admin session exists and is NOT a seller or buyer
  if (!admin || (admin.role === 'seller' || admin.role === 'buyer')) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminShell>{children}</AdminShell>;
}

// Route Guard for Seller Portal
function SellerProtectedRoute({ children }) {
  const { admin: user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'seller') {
    return <Navigate to="/seller/login" replace />;
  }
  return children;
}

// Route Guard for Buyer checkout/orders
function BuyerProtectedRoute({ children }) {
  const { admin: user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'buyer') {
    return <Navigate to="/buyer/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── BUYER PORTAL (Public storefront) ── */}
      <Route path="/" element={<Suspense fallback={<PageLoader />}><Storefront /></Suspense>} />
      <Route path="/product/:id" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
      <Route path="/cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
      <Route path="/buyer/login" element={<Suspense fallback={<PageLoader />}><BuyerLogin /></Suspense>} />
      <Route path="/buyer/register" element={<Suspense fallback={<PageLoader />}><BuyerRegister /></Suspense>} />
      
      {/* Buyer protected orders checkout */}
      <Route path="/checkout" element={<BuyerProtectedRoute><Suspense fallback={<PageLoader />}><Checkout /></Suspense></BuyerProtectedRoute>} />
      <Route path="/order-confirmation/:id" element={<BuyerProtectedRoute><Suspense fallback={<PageLoader />}><OrderConfirmation /></Suspense></BuyerProtectedRoute>} />
      <Route path="/my-orders" element={<BuyerProtectedRoute><Suspense fallback={<PageLoader />}><MyOrders /></Suspense></BuyerProtectedRoute>} />
      <Route path="/track-order/:id" element={<BuyerProtectedRoute><Suspense fallback={<PageLoader />}><TrackOrder /></Suspense></BuyerProtectedRoute>} />

      {/* ── SELLER PORTAL ── */}
      <Route path="/seller/login" element={<Suspense fallback={<PageLoader />}><SellerLogin /></Suspense>} />
      <Route path="/seller/register" element={<SellerRegister />} />
      <Route path="/seller" element={<SellerProtectedRoute><Suspense fallback={<PageLoader />}><SellerDashboard /></Suspense></SellerProtectedRoute>} />
      <Route path="/seller/products" element={<SellerProtectedRoute><Suspense fallback={<PageLoader />}><SellerProducts /></Suspense></SellerProtectedRoute>} />
      <Route path="/seller/orders" element={<SellerProtectedRoute><Suspense fallback={<PageLoader />}><SellerOrders /></Suspense></SellerProtectedRoute>} />
      <Route path="/seller/payments" element={<SellerProtectedRoute><Suspense fallback={<PageLoader />}><SellerPayments /></Suspense></SellerProtectedRoute>} />
      <Route path="/seller/profile" element={<SellerProtectedRoute><Suspense fallback={<PageLoader />}><SellerProfilePage /></Suspense></SellerProtectedRoute>} />

      {/* ── ADMIN PORTAL ── */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/sellers" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SellerList /></Suspense></ProtectedRoute>} />
      <Route path="/admin/sellers/:id" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SellerProfile /></Suspense></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ProductList /></Suspense></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><OrderList /></Suspense></ProtectedRoute>} />
      <Route path="/admin/logistics" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><LogisticsPage /></Suspense></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><PaymentsPage /></Suspense></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ReportsPage /></Suspense></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><NotificationsPage /></Suspense></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></ProtectedRoute>} />

      {/* Catch all redirects to Buyer storefront */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: 'var(--gray-900)',
              border: '1px solid var(--gray-200)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '13px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#2E7D32', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#B71C1C', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
