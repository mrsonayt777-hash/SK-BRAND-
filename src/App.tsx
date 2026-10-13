import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/PWAInstallButton';
import { ErrorBoundary } from './components/ErrorBoundary';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerAuthPage } from './pages/CustomerAuthPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { PolicyPage } from './pages/PolicyPage';
import { AboutPage, ContactPage } from './pages/ContentPages';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function AppContent() {
  const { isAdminAuthenticated } = useAuth();

  // Helper to parse current path into page and parameters
  const parseCurrentPath = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => { params[k] = v; });

      // Check hash routing fallback (e.g. #/products, #products)
      const hash = window.location.hash.replace(/^#\/?/, '').replace(/^\/+|\/+$/g, '');
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const queryPage = searchParams.get('page');

      const target = queryPage || hash || path;

      if (target === 'admin/login' || target === 'admin-login') return { page: 'admin-login', params };
      if (target.startsWith('admin')) return { page: 'admin-dashboard', params };
      if (target === 'products' || target === 'shop') return { page: 'products', params };
      if (target.startsWith('products/')) return { page: 'product-detail', params: { ...params, id: target.replace('products/', '') } };
      if (target === 'categories') return { page: 'categories', params };
      if (target === 'cart') return { page: 'cart', params };
      if (target === 'checkout') return { page: 'checkout', params };
      if (target === 'order-success') return { page: 'order-success', params };
      if (target === 'track-order') return { page: 'track-order', params };
      if (target === 'customer-login' || target === 'login') return { page: 'customer-login', params };
      if (target === 'customer-register' || target === 'register') return { page: 'customer-register', params };
      if (target === 'customer-profile' || target === 'profile') return { page: 'customer-profile', params };
      if (target === 'about') return { page: 'about', params };
      if (target === 'contact') return { page: 'contact', params };
      if (target === 'policy') return { page: 'policy', params };

      return { page: 'home', params };
    } catch {
      return { page: 'home', params: {} };
    }
  };

  const [currentRoute, setCurrentRoute] = useState<{ page: string; params: Record<string, string> }>(parseCurrentPath());
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  // Sync with browser back/forward buttons and hash changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentPath());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (page: string, params: Record<string, string> = {}) => {
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL
    let newPath = '/';
    if (page === 'admin-login') newPath = '/admin/login';
    else if (page === 'admin-dashboard') newPath = '/admin/dashboard';
    else if (page === 'products') newPath = '/products';
    else if (page === 'product-detail') newPath = `/products/${params.id || ''}`;
    else if (page === 'categories') newPath = '/categories';
    else if (page === 'cart') newPath = '/cart';
    else if (page === 'checkout') newPath = '/checkout';
    else if (page === 'order-success') newPath = '/order-success';
    else if (page === 'track-order') newPath = '/track-order';
    else if (page === 'customer-login') newPath = '/customer-login';
    else if (page === 'customer-register') newPath = '/customer-register';
    else if (page === 'customer-profile') newPath = '/customer-profile';
    else if (page === 'about') newPath = '/about';
    else if (page === 'contact') newPath = '/contact';
    else if (page === 'policy') newPath = '/policy';

    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k !== 'id') urlParams.append(k, v);
    });
    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : '';

    try {
      window.history.pushState({}, '', `${newPath}${queryString}`);
    } catch {}
  };

  const isAdminPage = currentRoute.page === 'admin-dashboard';

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Customer Storefront Header (suppressed on full Admin Dashboard) */}
      {!isAdminPage && (
        <Navbar onNavigate={navigate} currentPage={currentRoute.page} />
      )}

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentRoute.page === 'home' && (
          <HomePage onNavigate={navigate} />
        )}

        {currentRoute.page === 'products' && (
          <ProductsPage onNavigate={navigate} initialParams={currentRoute.params} />
        )}

        {currentRoute.page === 'product-detail' && (
          <ProductDetailPage
            productId={currentRoute.params.id || ''}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'categories' && (
          <CategoriesPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'cart' && (
          <CartPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'checkout' && (
          <CheckoutPage
            onNavigate={navigate}
            onOrderSuccess={(order) => setLastPlacedOrder(order)}
          />
        )}

        {currentRoute.page === 'order-success' && (
          <OrderSuccessPage
            order={lastPlacedOrder}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'track-order' && (
          <OrderTrackingPage
            initialParams={currentRoute.params}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'customer-login' && (
          <CustomerAuthPage onNavigate={navigate} isRegister={false} />
        )}

        {currentRoute.page === 'customer-register' && (
          <CustomerAuthPage onNavigate={navigate} isRegister={true} />
        )}

        {currentRoute.page === 'customer-profile' && (
          <CustomerProfilePage onNavigate={navigate} />
        )}

        {currentRoute.page === 'about' && (
          <AboutPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'contact' && (
          <ContactPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'policy' && (
          <PolicyPage
            initialTab={currentRoute.params.tab || 'shipping'}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'admin-login' && (
          <AdminLoginPage onNavigate={navigate} />
        )}

        {currentRoute.page === 'admin-dashboard' && (
          <AdminDashboardPage onNavigate={navigate} />
        )}
      </main>

      {/* Customer Storefront Footer (suppressed on full Admin Dashboard) */}
      {!isAdminPage && (
        <Footer onNavigate={navigate} />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
