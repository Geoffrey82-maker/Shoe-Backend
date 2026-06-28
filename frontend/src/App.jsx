import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';

// Store pages
import Home          from './pages/Home';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Auth          from './pages/Auth';
import OrderSuccess  from './pages/OrderSuccess';
import Orders        from './pages/Orders';
import Profile       from './pages/Profile';

// Admin
import AdminLayout   from './admin/components/AdminLayout';
import Dashboard     from './admin/pages/Dashboard';
import AdminOrders   from './admin/pages/AdminOrders';
import AdminProducts from './admin/pages/AdminProducts';
import AdminCoupons  from './admin/pages/AdminCoupons';
import AdminAnalytics from './admin/pages/AdminAnalytics';

import { useThemeStore, useAuthStore, useCartStore, useWishlistStore } from './store';

/* ── Route guards ─────────────────────────────────────────── */
function Protected({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/auth" replace />;
}

function AdminGuard({ children }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/auth" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/* ── 404 ─────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      style={{ paddingTop: 'var(--nav-h)' }}
    >
      <p className="font-display text-[120px] font-black text-[--pr] leading-none">404</p>
      <p className="text-xl font-semibold text-[--tx] mb-2">Page not found</p>
      <p className="text-[--tx-m] text-sm mb-8">The page you're looking for doesn't exist.</p>
      <a
        href="/"
        className="bg-[--pr] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[--pr-d] transition-colors"
      >
        Back to home
      </a>
    </div>
  );
}

export default function App() {
  const { init }             = useThemeStore();
  const { token }            = useAuthStore();
  const { fetch: fetchCart } = useCartStore();
  const { fetch: fetchWish } = useWishlistStore();

  useEffect(() => { init(); }, []);
  useEffect(() => { if (token) { fetchCart(); fetchWish(); } }, [token]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Admin CMS (own layout, no storefront Navbar) ── */}
        <Route
          path="/admin"
          element={<AdminGuard><AdminLayout /></AdminGuard>}
        >
          <Route index            element={<Dashboard />} />
          <Route path="orders"    element={<AdminOrders />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="coupons"   element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* ── Storefront (with Navbar) ──────────────────── */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/shop"          element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart"          element={<Cart />} />
                <Route path="/auth"          element={<Auth />} />
                <Route path="/checkout"      element={<Protected><Checkout /></Protected>} />
                <Route path="/order-success" element={<Protected><OrderSuccess /></Protected>} />
                <Route path="/orders"        element={<Protected><Orders /></Protected>} />
                <Route path="/profile"       element={<Protected><Profile /></Protected>} />
                <Route path="*"              element={<NotFound />} />
              </Routes>
            </>
          }
        />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background:   'var(--cd)',
            color:        'var(--tx)',
            border:       '1px solid var(--bd)',
            borderRadius: '12px',
            fontSize:     '13px',
            fontWeight:   500,
          },
          success: { iconTheme: { primary: '#E8441A', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  );
}
