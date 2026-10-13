import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingPageProps {
  initialParams?: Record<string, string>;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialParams = {}, onNavigate }) => {
  const [orderNumber, setOrderNumber] = useState<string>(initialParams.orderNumber || '');
  const [verification, setVerification] = useState<string>(initialParams.phone || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (ordNo: string, verif: string) => {
    if (!ordNo.trim() || !verif.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: ordNo.trim(), verification: verif.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order not found.');
      }
      setOrder({ ...data.order, items: data.items, history: data.history });
    } catch (err: any) {
      setError(err.message || 'Failed to locate order.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams.orderNumber && initialParams.phone) {
      fetchTracking(initialParams.orderNumber, initialParams.phone);
    }
  }, [initialParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, verification);
  };

  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStatusIndex = order ? steps.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Live Delivery Status</span>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Track Your Order</h1>
        <p className="text-xs text-slate-500">
          Enter your Order Number and the mobile number or email used during Cash on Delivery checkout.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Order Number *</label>
              <input
                type="text"
                placeholder="e.g. SKB-2026-123456"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 uppercase font-mono font-bold focus:outline-hidden focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800">Mobile Number or Email *</label>
              <input
                type="text"
                placeholder="10-digit mobile or email"
                value={verification}
                onChange={e => setVerification(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Locating Order...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Order</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Tracking Result View */}
      {order && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Details</span>
              <p className="text-xl font-black text-slate-950 font-mono">{order.order_number}</p>
              <p className="text-xs text-slate-500 mt-0.5">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="text-right sm:text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'Cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-sky-100 text-sky-900'
              }`}>
                Status: {order.status}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                COD Amount: ₹{order.total_amount?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Interactive Visual Status Timeline */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-red-900">Order Cancelled</p>
              <p className="text-red-700">Reason: {order.cancellation_reason || 'Cancelled per customer or operational request.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fulfillment Progress</h3>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs">
                {steps.map((step, idx) => {
                  const isDone = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 transition ${
                        isDone
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-sky-400" /> : idx + 1}
                      </div>
                      <span className={`font-semibold ${isCurrent ? 'text-slate-950 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar line */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-slate-950 h-full transition-all duration-700"
                  style={{ width: `${Math.max(10, ((currentStatusIndex + 1) / steps.length) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Activity Log History */}
          {order.history && order.history.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Tracking Updates</span>
              </h3>
              <div className="space-y-2.5">
                {order.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{h.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items in order */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>Items in this shipment</span>
              </h3>
              <div className="divide-y divide-slate-100">
                {order.items.map((itm, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{itm.product_title}</p>
                      <p className="text-[11px] text-slate-500">Qty: {itm.quantity} {itm.selected_variant ? `(${itm.selected_variant})` : ''}</p>
                    </div>
                    <span className="font-bold text-slate-900">₹{(itm.price * itm.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
