import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, Shield, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Category, StoreSettings } from '../types';

interface NavbarProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { itemCount } = useCart();
  const { customerUser, logoutCustomer, isAdminAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data)) setCategories(data.slice(0, 6));
      })
      .catch(() => {});

    fetch('/api/store/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') setSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">
              {settings.announcement_bar || 'Cash on Delivery available across India • Free shipping on orders above ₹1,499'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300 text-[11px] shrink-0">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-sky-400" />
              {settings.contact_phone || '+91 98765 43210'}
            </span>
            <button
              onClick={() => onNavigate('track-order')}
              className="hover:text-white transition underline cursor-pointer"
            >
              Track Order
            </button>
            {isAdminAuthenticated && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-md focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Custom SK BRAND Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-white shadow-xs group-hover:bg-slate-900 transition">
                <span className="text-sm sm:text-base font-black tracking-tighter leading-none">SK</span>
                <span className="text-[7px] sm:text-[8px] font-bold tracking-widest text-sky-400 leading-none mt-0.5">BRAND</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 font-serif leading-none">
                  SK BRAND
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                  Artisanal India
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search kurtas, shirts, jackets, mojaris..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 focus:bg-white transition"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </form>
          </div>

          {/* Right Action Icons & PWA Install */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Customer Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                aria-label="User Account"
              >
                <User className="w-5 h-5" />
                <span className="hidden xl:inline text-xs font-semibold">
                  {customerUser ? customerUser.full_name.split(' ')[0] : 'Account'}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  {customerUser ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{customerUser.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{customerUser.email}</p>
                      </div>
                      <button
                        onClick={() => onNavigate('customer-profile')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        My Profile & Orders
                      </button>
                      <button
                        onClick={() => onNavigate('track-order')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        Track An Order
                      </button>
                      <button
                        onClick={logoutCustomer}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 font-medium cursor-pointer border-t border-slate-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-slate-500 text-[11px] border-b border-slate-100">
                        Sign in for personalized order tracking
                      </div>
                      <button
                        onClick={() => onNavigate('customer-login')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-900 font-semibold cursor-pointer"
                      >
                        Customer Login
                      </button>
                      <button
                        onClick={() => onNavigate('customer-register')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => onNavigate('track-order')}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer border-t border-slate-100"
                      >
                        Track An Order
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => onNavigate(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
                      className="w-full text-left px-4 py-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3 h-3 text-sky-600" />
                      {isAdminAuthenticated ? 'Admin Dashboard' : 'Store Owner Login'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-900 transition cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-slate-950 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search kurtas, shirts, footwear..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>

        {/* Category Navigation Bar (Clean unboxed text links conforming to frontend-design constitution) */}
        <nav className="hidden lg:flex items-center gap-6 py-2 border-t border-slate-100 text-xs font-medium text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-slate-950 transition cursor-pointer ${currentPage === 'home' ? 'text-slate-950 font-bold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('products')}
            className={`hover:text-slate-950 transition cursor-pointer ${currentPage === 'products' ? 'text-slate-950 font-bold' : ''}`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="hover:text-slate-950 transition cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => onNavigate('categories')}
            className="hover:text-slate-950 transition cursor-pointer text-slate-500"
          >
            All Categories →
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-950 text-white flex items-center justify-center font-bold text-xs">SK</div>
                  <span className="font-bold font-serif text-slate-950">SK BRAND</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <PWAInstallButton variant="banner" />
              </div>

              <div className="space-y-1 text-sm font-medium text-slate-800">
                <button
                  onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  Home
                </button>
                <button
                  onClick={() => { onNavigate('products'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  All Products
                </button>
                <button
                  onClick={() => { onNavigate('categories'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  Shop By Category
                </button>

                <div className="pt-2 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Featured Categories
                </div>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onNavigate('products', { category: c.slug }); setIsMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {c.name}
                  </button>
                ))}

                <div className="pt-3 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Help & Policies
                </div>
                <button
                  onClick={() => { onNavigate('track-order'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Track Order
                </button>
                <button
                  onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Contact & Support
                </button>
                <button
                  onClick={() => { onNavigate('policy', { tab: 'shipping' }); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-1.5 px-3 rounded-lg text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cash on Delivery & Shipping Policy
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs">
              <button
                onClick={() => { onNavigate('admin-login'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-slate-600 hover:text-slate-950 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Store Owner / Admin Login
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Android & Mobile-first App Bar) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around text-slate-600 shadow-lg">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${currentPage === 'home' ? 'text-slate-950 font-bold' : ''}`}
        >
          <span className="w-4 h-4 flex items-center justify-center text-xs">🏠</span>
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('categories')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${currentPage === 'categories' ? 'text-slate-950 font-bold' : ''}`}
        >
          <span className="w-4 h-4 flex items-center justify-center text-xs">📂</span>
          <span>Categories</span>
        </button>
        <button
          onClick={() => onNavigate('products')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${currentPage === 'products' ? 'text-slate-950 font-bold' : ''}`}
        >
          <Search className="w-4 h-4" />
          <span>Shop</span>
        </button>
        <button
          onClick={() => onNavigate('cart')}
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium ${currentPage === 'cart' ? 'text-slate-950 font-bold' : ''}`}
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-slate-950 text-white text-[9px] font-bold px-1 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
        <button
          onClick={() => onNavigate(customerUser ? 'customer-profile' : 'customer-login')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${currentPage.startsWith('customer') ? 'text-slate-950 font-bold' : ''}`}
        >
          <User className="w-4 h-4" />
          <span>{customerUser ? 'Profile' : 'Login'}</span>
        </button>
      </div>
    </header>
  );
};
