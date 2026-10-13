import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, User, LogOut, ArrowRight, Clock } from 'lucide-react';
import { Order } from '../types';

interface CustomerProfilePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ onNavigate }) => {
  const { customerUser, customerToken, logoutCustomer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerToken) {
      onNavigate('customer-login');
      return;
    }

    fetch('/api/customer/orders', {
      headers: { Authorization: `Bearer ${customerToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [customerToken, onNavigate]);

  if (!customerUser) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xl">
            {customerUser.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-950">
              {customerUser.full_name}
            </h1>
            <p className="text-xs text-slate-500">{customerUser.email}</p>
            {customerUser.phone && (
              <p className="text-[11px] text-slate-400 mt-0.5">Mobile: +91 {customerUser.phone}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            logoutCustomer();
            onNavigate('home');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition cursor-pointer self-start sm:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <Package className="w-5 h-5 text-sky-600" />
            <span>My Order History</span>
          </h2>
          <span className="text-xs text-slate-500">{orders.length} order(s) found</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-32 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No orders yet</h3>
            <p className="text-xs text-slate-500">You haven&apos;t placed any orders with this account yet.</p>
            <button
              onClick={() => onNavigate('products')}
              className="px-5 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Order</span>
                    <p className="font-bold text-slate-950 font-mono text-sm">{order.order_number}</p>
                    <p className="text-slate-500 text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-sky-100 text-sky-900'
                    }`}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => onNavigate('track-order', { orderNumber: order.order_number, phone: order.customer_phone })}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-1 text-xs text-slate-700">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.product_title} × {item.quantity}</span>
                        <span className="font-semibold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cash on Delivery (COD) Total:</span>
                  <span className="font-black text-slate-950 text-sm">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
