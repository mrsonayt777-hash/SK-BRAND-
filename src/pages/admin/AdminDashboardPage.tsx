import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, Folders, ShoppingCart, Users, Tag, Settings,
  Shield, Smartphone, LogOut, Plus, Search, Filter, Edit, Trash2, CheckCircle2,
  AlertTriangle, Truck, DollarSign, Clock, RefreshCw, X, ExternalLink, Printer,
  Eye, Save, Lock
} from 'lucide-react';
import { Product, Category, Order, Coupon, StoreSettings } from '../../types';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { adminUser, adminToken, logoutAdmin, isAdminAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Dashboard Data State
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & Forms State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{ open: boolean; orderId: string; currentStatus: string } | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Confirmed');
  const [statusComment, setStatusComment] = useState<string>('');

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [passwordNotice, setPasswordNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');

  // Protect Admin Route: Redirect if not logged in
  useEffect(() => {
    if (!isAdminAuthenticated || !adminToken) {
      onNavigate('admin-login');
    }
  }, [isAdminAuthenticated, adminToken, onNavigate]);

  // Fetch data on tab change or init
  const fetchData = async () => {
    if (!adminToken) return;
    setIsLoading(true);
    const headers = { Authorization: `Bearer ${adminToken}` };

    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/admin/analytics', { headers });
        setAnalytics(await res.json());
      } else if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/admin/products', { headers }),
          fetch('/api/admin/categories', { headers })
        ]);
        setProducts(await prodRes.json());
        setCategories(await catRes.json());
      } else if (activeTab === 'categories') {
        const res = await fetch('/api/admin/categories', { headers });
        setCategories(await res.json());
      } else if (activeTab === 'orders') {
        const res = await fetch('/api/admin/orders', { headers });
        setOrders(await res.json());
      } else if (activeTab === 'customers') {
        const res = await fetch('/api/admin/customers', { headers });
        setCustomers(await res.json());
      } else if (activeTab === 'coupons') {
        const res = await fetch('/api/admin/coupons', { headers });
        setCoupons(await res.json());
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/admin/settings', { headers });
        setSettings(await res.json());
      } else if (activeTab === 'security') {
        const res = await fetch('/api/admin/activity-logs', { headers });
        setActivityLogs(await res.json());
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchData();
    }
  }, [activeTab, adminToken]);

  // Product Save Handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const isEditing = !!editingProduct?.id;
    const url = isEditing ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    // Parse image URLs
    const imagesRaw = formData.get('images_list')?.toString() || '';
    const images = imagesRaw.split(',').map(s => s.trim()).filter(Boolean);

    // Variants
    const sizes = (formData.get('variants_sizes')?.toString() || '').split(',').map(s => s.trim()).filter(Boolean);
    const colors = (formData.get('variants_colors')?.toString() || '').split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      sku: formData.get('sku'),
      description: formData.get('description'),
      category_id: formData.get('category_id'),
      price: formData.get('price'),
      sale_price: formData.get('sale_price') || null,
      stock: formData.get('stock'),
      is_featured: formData.get('is_featured') === 'on' ? 1 : 0,
      is_active: formData.get('is_active') === 'on' ? 1 : 0,
      variants: { sizes, colors },
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80']
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setProductModalOpen(false);
      setEditingProduct(null);
      showToast(isEditing ? 'Product updated successfully.' : 'Product created successfully.');
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save product.', 'error');
    }
  };

  // Product Image Upload
  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: data
    });

    const json = await res.json();
    if (res.ok && json.url) {
      setEditingProduct((prev: any) => {
        const existingImgs = prev?.images || [];
        return {
          ...prev,
          images: [json.url, ...existingImgs]
        };
      });
      showToast('Image uploaded successfully.');
    } else {
      showToast(json.error || 'Upload failed.', 'error');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string, title: string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    showToast(data.message || `Product ${title} updated.`);
    fetchData();
  };

  // Category Save Handler
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const isEditing = !!editingCategory?.id;
    const url = isEditing ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      image_url: formData.get('image_url'),
      display_order: formData.get('display_order'),
      is_active: formData.get('is_active') === 'on' ? 1 : 0
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setCategoryModalOpen(false);
      setEditingCategory(null);
      showToast(isEditing ? 'Category updated.' : 'Category created.');
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Category deleted.');
      fetchData();
    } else {
      showToast(data.error || 'Could not delete category.', 'error');
    }
  };

  // Order Status Update
  const handleUpdateOrderStatus = async () => {
    if (!statusUpdateModal) return;

    const res = await fetch(`/api/admin/orders/${statusUpdateModal.orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: newStatus,
        comment: statusComment,
        cancellation_reason: newStatus === 'Cancelled' ? statusComment : undefined
      })
    });

    const data = await res.json();
    if (res.ok) {
      setStatusUpdateModal(null);
      setStatusComment('');
      fetchData();
      if (selectedOrder && selectedOrder.id === statusUpdateModal.orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
      showToast(`Order status updated to ${newStatus}.`);
    } else {
      showToast(data.error || 'Failed to update order status.', 'error');
    }
  };

  // Coupon Save Handler
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const isEditing = !!editingCoupon?.id;
    const url = isEditing ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      code: formData.get('code'),
      discount_type: formData.get('discount_type'),
      discount_value: formData.get('discount_value'),
      min_order_value: formData.get('min_order_value'),
      max_discount: formData.get('max_discount'),
      usage_limit: formData.get('usage_limit'),
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
      is_active: formData.get('is_active') === 'on' ? 1 : 0
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setCouponModalOpen(false);
      setEditingCoupon(null);
      showToast(isEditing ? 'Coupon updated.' : 'Coupon created.');
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.error || 'Failed to save coupon.', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    showToast('Coupon removed.');
    fetchData();
  };

  // Save Store Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};

    formData.forEach((value, key) => {
      payload[key] = value.toString();
    });

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Store settings saved successfully!');
      fetchData();
    } else {
      showToast('Failed to save settings.', 'error');
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(passwordForm)
    });

    const data = await res.json();
    if (res.ok) {
      setPasswordNotice({ success: true, message: 'Password updated successfully!' });
      setPasswordForm({ current_password: '', new_password: '' });
    } else {
      setPasswordNotice({ success: false, message: data.error || 'Failed to update password.' });
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Folders },
    { id: 'orders', label: 'Orders (COD)', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'security', label: 'Security & Logs', icon: Shield },
    { id: 'android', label: 'Android APK / PWA', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-slate-950 flex flex-col items-center justify-center font-bold text-xs">
            SK
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight font-serif leading-none">
              SK BRAND Owner Portal
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Production Store Administration</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3 text-sky-400" />
          </button>

          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-200">{adminUser?.full_name || 'Store Owner'}</p>
            <p className="text-[10px] text-slate-400">{adminUser?.email}</p>
          </div>

          <button
            onClick={() => {
              logoutAdmin();
              onNavigate('admin-login');
            }}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Secure Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* In-app Toast Banner */}
      {toastMessage && (
        <div className={`py-2 px-4 text-xs font-semibold text-center transition-all ${
          toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-3 sm:p-4 shrink-0 overflow-x-auto lg:overflow-visible">
          <nav className="flex lg:flex-col gap-1 text-xs">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition text-left cursor-pointer whitespace-nowrap lg:whitespace-normal ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Admin Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Store Performance Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time metrics from SQLite database</p>
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Metrics</span>
                </button>
              </div>

              {analytics && (
                <>
                  {/* Revenue Distinction Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold">Gross Order Value</span>
                        <DollarSign className="w-4 h-4 text-sky-600" />
                      </div>
                      <p className="text-2xl font-black font-sans text-slate-950">
                        ₹{analytics.revenue.total_gross_value?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-slate-400">Total value across all orders</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold">Delivered COD Collected</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black font-sans text-emerald-700">
                        ₹{analytics.revenue.delivered_cod_collected?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">Cash collected upon completed delivery</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500 text-xs">
                        <span className="font-semibold">Pending COD in Transit</span>
                        <Truck className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-2xl font-black font-sans text-amber-700">
                        ₹{analytics.revenue.pending_cod_collection?.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-amber-700 font-medium">Pending collection by courier</p>
                    </div>
                  </div>

                  {/* Orders Status Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total Orders</p>
                      <p className="text-xl font-black text-slate-950 mt-1">{analytics.orders.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-amber-600 font-bold uppercase">Pending</p>
                      <p className="text-xl font-black text-amber-600 mt-1">{analytics.orders.pending}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-sky-600 font-bold uppercase">Confirmed</p>
                      <p className="text-xl font-black text-sky-600 mt-1">{analytics.orders.confirmed_or_processing}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase">Shipped</p>
                      <p className="text-xl font-black text-indigo-600 mt-1">{analytics.orders.shipped}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Delivered</p>
                      <p className="text-xl font-black text-emerald-600 mt-1">{analytics.orders.delivered}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] text-red-600 font-bold uppercase">Cancelled</p>
                      <p className="text-xl font-black text-red-600 mt-1">{analytics.orders.cancelled}</p>
                    </div>
                  </div>

                  {/* Inventory Alert Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Low Stock Alert</h3>
                        <p className="text-xs text-slate-500">{analytics.inventory.low_stock} product(s) with 5 or fewer items remaining</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200"
                      >
                        Check Inventory
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Active Catalog</h3>
                        <p className="text-xs text-slate-500">{analytics.inventory.total_products} total product listings in database</p>
                      </div>
                      <button
                        onClick={() => { setActiveTab('products'); setEditingProduct(null); setProductModalOpen(true); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 text-white font-bold text-xs"
                      >
                        + Add Product
                      </button>
                    </div>
                  </div>

                  {/* Recent Orders Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs text-sky-600 hover:underline font-semibold">
                        View All Orders →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Order Number</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analytics.recent_orders?.map((ord: any) => (
                            <tr key={ord.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{ord.order_number}</td>
                              <td className="py-2.5 px-3">{ord.customer_name}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-950">₹{ord.total_amount?.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-sky-100 text-sky-900'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{new Date(ord.created_at).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PRODUCT MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Product Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage catalogue, stock inventory, prices, and images</p>
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setProductModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Search & Filter Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by product name, SKU, or category..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="flex-1 text-xs text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price / Sale</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products
                        .filter(p => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img src={p.primary_image || (p.images && p.images[0]) || ''} alt={p.title} className="w-10 h-12 object-cover rounded bg-slate-100 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 line-clamp-1">{p.title}</p>
                                {p.is_featured === 1 && (
                                  <span className="text-[10px] font-semibold text-sky-600">Featured</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{p.sku}</td>
                            <td className="py-3 px-4 text-slate-600">{p.category_name}</td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900">₹{p.price}</span>
                              {p.sale_price && (
                                <span className="block text-[11px] text-emerald-700 font-semibold">Sale: ₹{p.sale_price}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-slate-800'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {p.is_active === 1 ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setEditingProduct(p); setProductModalOpen(true); }}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.title)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                                  title="Delete or Deactivate"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CATEGORY MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Category Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Organize store catalog into browseable collections</p>
                </div>
                <button
                  onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={c.image_url} alt={c.name} className="w-14 h-14 object-cover rounded-xl bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">slug: {c.slug}</p>
                        <p className="text-[11px] text-sky-600 font-semibold">{c.product_count || 0} Products</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Order: {c.display_order}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingCategory(c); setCategoryModalOpen(true); }}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: ORDER MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Cash on Delivery Orders</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage customer shipments, status progression, and COD payments</p>
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Orders</span>
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Order Number, Customer Name, or Mobile..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-transparent focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={e => setOrderStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer Details</th>
                        <th className="py-3 px-4">COD Payable</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders
                        .filter(o => {
                          const matchesSearch = !orderSearch ||
                            o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer_phone.includes(orderSearch);
                          const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map(o => (
                          <tr key={o.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-950">{o.order_number}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{o.customer_name}</p>
                              <p className="text-[11px] text-slate-500">+91 {o.customer_phone}</p>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-950 font-sans">
                              ₹{o.total_amount?.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                o.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-sky-100 text-sky-900'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(o.created_at).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    fetch(`/api/admin/orders/${o.id}`, { headers: { Authorization: `Bearer ${adminToken}` } })
                                      .then(r => r.json())
                                      .then(data => setSelectedOrder(data));
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setStatusUpdateModal({ open: true, orderId: o.id, currentStatus: o.status });
                                    setNewStatus(o.status === 'Pending' ? 'Confirmed' : o.status === 'Confirmed' ? 'Processing' : o.status === 'Processing' ? 'Shipped' : 'Delivered');
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-900 text-white font-semibold cursor-pointer"
                                >
                                  Update Status
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CUSTOMER MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Customer Accounts</h2>
                <p className="text-xs text-slate-500 mt-0.5">Registered store customers and purchase histories (Passwords protected with salted hash)</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Orders Placed</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{c.full_name}</td>
                        <td className="py-3 px-4">{c.email}</td>
                        <td className="py-3 px-4">{c.phone || '—'}</td>
                        <td className="py-3 px-4 font-bold">{c.order_count || 0}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">₹{(c.total_spend || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: COUPON MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Discount Coupons</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure promotional codes, percentage discounts, and order thresholds</p>
                </div>
                <button
                  onClick={() => { setEditingCoupon(null); setCouponModalOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Min Order</th>
                      <th className="py-3 px-4">Usage</th>
                      <th className="py-3 px-4">Valid Window</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map(cpn => (
                      <tr key={cpn.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-black text-sky-700">{cpn.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {cpn.discount_type === 'percent' ? `${cpn.discount_value}% off` : `₹${cpn.discount_value} flat`}
                        </td>
                        <td className="py-3 px-4">₹{cpn.min_order_value || 0}</td>
                        <td className="py-3 px-4">{cpn.usage_count} / {cpn.usage_limit || '∞'}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {cpn.start_date || 'Start'} to {cpn.end_date || 'Forever'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cpn.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {cpn.is_active === 1 ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingCoupon(cpn); setCouponModalOpen(true); }}
                              className="p-1.5 text-slate-600 hover:text-slate-900"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(cpn.id)}
                              className="p-1.5 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: STORE SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Store Settings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure store identity, delivery charges, and announcements</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 text-xs shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Store Name</label>
                    <input
                      type="text"
                      name="store_name"
                      defaultValue={settings.store_name || 'SK BRAND'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Tagline</label>
                    <input
                      type="text"
                      name="store_tagline"
                      defaultValue={settings.store_tagline || 'Timeless Indian Craftsmanship'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      defaultValue={settings.contact_email || 'support@skbrand.in'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Contact Phone</label>
                    <input
                      type="text"
                      name="contact_phone"
                      defaultValue={settings.contact_phone || '+91 98765 43210'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-800">Studio & Business Address</label>
                    <input
                      type="text"
                      name="business_address"
                      defaultValue={settings.business_address || ''}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Standard Delivery Charge (₹)</label>
                    <input
                      type="number"
                      name="delivery_charge"
                      defaultValue={settings.delivery_charge || '99'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      name="free_shipping_threshold"
                      defaultValue={settings.free_shipping_threshold || '1499'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-800">Top Header Announcement Bar</label>
                    <input
                      type="text"
                      name="announcement_bar"
                      defaultValue={settings.announcement_bar || ''}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-sky-400" />
                    <span>Save Store Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 8: SECURITY & AUDIT LOGS */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Security & Activity Audit</h2>
                <p className="text-xs text-slate-500 mt-0.5">Owner credential protection & immutable audit logs of privileged actions</p>
              </div>

              {/* Change Owner Password Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs max-w-md text-xs">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>Update Owner Password</span>
                </h3>

                {passwordNotice && (
                  <p className={`p-2.5 rounded-lg ${passwordNotice.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                    {passwordNotice.message}
                  </p>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.current_password}
                      onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">New Password (min 8 chars)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordForm.new_password}
                      onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-950 text-white font-bold rounded-lg hover:bg-slate-900 transition"
                  >
                    Change Password
                  </button>
                </form>
              </div>

              {/* Admin Activity Audit Trail */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Administrative Activity Log</h3>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">
                          {log.action} <span className="text-slate-400 font-normal">on {log.entity_type} ({log.entity_id})</span>
                        </p>
                        <p className="text-[11px] text-slate-600">{log.details}</p>
                        <p className="text-[10px] text-slate-400">IP: {log.ip_address} • By: {log.admin_name || 'Admin'}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 9: ANDROID APK & PWA GUIDE */}
          {/* ======================================================== */}
          {activeTab === 'android' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950">Android App & PWA Packaging Guide</h2>
                <p className="text-xs text-slate-500 mt-0.5">Instructions for installing as a PWA and building an Android APK</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed shadow-xs">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-sky-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-600" />
                    <span>PWA Installation is Active</span>
                  </h3>
                  <p className="text-sky-800">
                    SK BRAND includes a compliant Web App Manifest, auto-updating service worker, and standard 192px/512px icon definitions. On compatible Android devices, visitors can click &quot;Install App&quot; in the header or prompt to install SK BRAND directly.
                  </p>
                </div>

                <h3 className="text-sm font-bold text-slate-900">Method 1: Turn PWA into Android APK using PWABuilder (Recommended & Free)</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Visit <strong>PWABuilder.com</strong> in your browser.</li>
                  <li>Enter your live production URL (e.g. <code>https://ais-dev-...run.app</code>).</li>
                  <li>PWABuilder will inspect the manifest, service worker, and icons.</li>
                  <li>Click <strong>&quot;Generate APK&quot;</strong> (Trusted Web Activity - TWA).</li>
                  <li>Download the signed APK or publish the App Bundle (.aab) directly to the Google Play Store!</li>
                </ol>

                <h3 className="text-sm font-bold text-slate-900">Method 2: Google Bubblewrap CLI (Official Google TWA tool)</h3>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono">
{`# 1. Install Google Bubblewrap CLI globally
npm install -g @bubblewrap/cli

# 2. Initialize project from your live store URL
bubblewrap init --manifest="https://<YOUR-APP-URL>/manifest.webmanifest"

# 3. Build signed Android APK
bubblewrap build`}
                </pre>

                <h3 className="text-sm font-bold text-slate-900">Method 3: Capacitor / Android Studio</h3>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono">
{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "SK BRAND" "in.skbrand.app"
npm run build
npx cap add android
npx cap open android`}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800">Product Title *</label>
                  <input
                    type="text"
                    required
                    name="title"
                    defaultValue={editingProduct?.title || ''}
                    placeholder="e.g. SK Royal Indigo Embroidered Kurta"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    name="sku"
                    defaultValue={editingProduct?.sku || ''}
                    placeholder="SKB-ETH-101"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Category *</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id || (categories[0]?.id || '')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    name="price"
                    defaultValue={editingProduct?.price || ''}
                    placeholder="2499"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Sale / Discount Price (₹, optional)</label>
                  <input
                    type="number"
                    name="sale_price"
                    defaultValue={editingProduct?.sale_price || ''}
                    placeholder="1899"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Inventory Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    name="stock"
                    defaultValue={editingProduct?.stock !== undefined ? editingProduct.stock : 25}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Sizes (comma separated)</label>
                  <input
                    type="text"
                    name="variants_sizes"
                    defaultValue={editingProduct?.variants?.sizes ? editingProduct.variants.sizes.join(', ') : 'M (38), L (40), XL (42)'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800">Colors (comma separated)</label>
                  <input
                    type="text"
                    name="variants_colors"
                    defaultValue={editingProduct?.variants?.colors ? editingProduct.variants.colors.join(', ') : 'Royal Indigo, Heritage White'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-800">Description *</label>
                  <textarea
                    rows={3}
                    required
                    name="description"
                    defaultValue={editingProduct?.description || ''}
                    placeholder="Handcrafted pure slub cotton kurta with delicate needlework..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>

                {/* Images Upload / URLs */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="font-bold text-slate-800">Product Images (URLs separated by comma)</label>
                  <textarea
                    rows={2}
                    name="images_list"
                    defaultValue={editingProduct?.images ? editingProduct.images.join(', ') : ''}
                    placeholder="https://images.unsplash.com/photo-..., https://..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-[11px]"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">Or upload image file from device:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImageFile}
                      className="text-[11px] text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                  <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={editingProduct?.is_featured === 1}
                      className="accent-slate-950 w-4 h-4"
                    />
                    <span>Mark as Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={editingProduct ? editingProduct.is_active === 1 : true}
                      className="accent-slate-950 w-4 h-4"
                    />
                    <span>Active in Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CATEGORY MODAL */}
      {/* ======================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Category Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  defaultValue={editingCategory?.name || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Slug (URL identifier)</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingCategory?.slug || ''}
                  placeholder="mens-ethnic"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  name="description"
                  defaultValue={editingCategory?.description || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  defaultValue={editingCategory?.image_url || ''}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Display Order</label>
                <input
                  type="number"
                  name="display_order"
                  defaultValue={editingCategory?.display_order || 0}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingCategory ? editingCategory.is_active === 1 : true}
                  className="accent-slate-950 w-4 h-4"
                />
                <span>Active</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-950 text-white font-bold rounded-lg"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: COUPON MODAL */}
      {/* ======================================================== */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setCouponModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Coupon Code *</label>
                <input
                  type="text"
                  required
                  name="code"
                  defaultValue={editingCoupon?.code || ''}
                  placeholder="FESTIVE20"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Discount Type</label>
                  <select
                    name="discount_type"
                    defaultValue={editingCoupon?.discount_type || 'percent'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Discount Value *</label>
                  <input
                    type="number"
                    required
                    name="discount_value"
                    defaultValue={editingCoupon?.discount_value || 10}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Min Order Value (₹)</label>
                  <input
                    type="number"
                    name="min_order_value"
                    defaultValue={editingCoupon?.min_order_value || 0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Max Discount (₹, for %)</label>
                  <input
                    type="number"
                    name="max_discount"
                    defaultValue={editingCoupon?.max_discount || 0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Usage Limit (0 for unlimited)</label>
                <input
                  type="number"
                  name="usage_limit"
                  defaultValue={editingCoupon?.usage_limit || 0}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingCoupon?.start_date || ''}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingCoupon?.end_date || ''}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editingCoupon ? editingCoupon.is_active === 1 : true}
                  className="accent-slate-950 w-4 h-4"
                />
                <span>Active</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-950 text-white font-bold rounded-lg"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER DETAILS & PRINT INVOICE */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Order Inspection</span>
                <h3 className="font-mono font-black text-base text-slate-950">{selectedOrder.order_number}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Address */}
            {selectedOrder.shipping_address && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.shipping_address.full_name}</p>
                <p className="text-slate-600">{selectedOrder.shipping_address.house_street}, {selectedOrder.shipping_address.area_locality}</p>
                <p className="text-slate-600">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - <strong>{selectedOrder.shipping_address.pincode}</strong></p>
                <p className="text-slate-600">Mobile: <strong>+91 {selectedOrder.shipping_address.phone}</strong></p>
                {selectedOrder.shipping_address.delivery_instructions && (
                  <p className="text-[11px] text-sky-800 pt-1">Note: {selectedOrder.shipping_address.delivery_instructions}</p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Line Items</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_title}</p>
                      <p className="text-[11px] text-slate-400">SKU: {item.sku} • Qty: {item.quantity} {item.selected_variant ? `• ${item.selected_variant}` : ''}</p>
                    </div>
                    <span className="font-bold text-slate-950">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5 text-right border-t border-slate-100 pt-3">
              <p>Subtotal: <strong className="text-slate-900">₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</strong></p>
              {selectedOrder.discount_amount > 0 && (
                <p className="text-emerald-700">Coupon Discount: -₹{selectedOrder.discount_amount?.toLocaleString('en-IN')}</p>
              )}
              <p>Delivery: <strong className="text-slate-900">₹{selectedOrder.delivery_charge}</strong></p>
              <p className="text-base font-black text-slate-950 font-sans pt-1">
                COD Total to Collect: ₹{selectedOrder.total_amount?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPDATE ORDER STATUS */}
      {/* ======================================================== */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Update Order Status</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-800">New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled (Restores Inventory)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">
                  {newStatus === 'Cancelled' ? 'Cancellation Reason *' : 'Status Note / Comment'}
                </label>
                <input
                  type="text"
                  placeholder={newStatus === 'Cancelled' ? 'e.g. Out of stock / Customer requested' : 'e.g. Handed over to BlueDart courier'}
                  value={statusComment}
                  onChange={e => setStatusComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setStatusUpdateModal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrderStatus}
                  className="px-4 py-1.5 bg-slate-950 text-white font-bold rounded-lg"
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
