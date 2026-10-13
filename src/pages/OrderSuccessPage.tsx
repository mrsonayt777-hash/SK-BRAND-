import React from 'react';
import { CheckCircle2, Truck, Package, ArrowRight, Printer } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessPageProps {
  order: Order | null;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Completed</h2>
        <p className="text-xs text-slate-500">Thank you for your purchase from SK BRAND.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const addr = order.shipping_address || (order.shipping_address_json ? JSON.parse(order.shipping_address_json) : null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
          Thank you for choosing SK BRAND!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Your order has been recorded in our system. Our tailoring and fulfillment team will dispatch your package shortly.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Order Number & COD Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Number</p>
            <p className="text-xl font-black text-slate-950 font-mono tracking-tight">{order.order_number}</p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Truck className="w-3.5 h-3.5" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Pay <strong>₹{order.total_amount?.toLocaleString('en-IN')}</strong> in cash upon delivery
            </p>
          </div>
        </div>

        {/* Delivery Details Snapshot */}
        {addr && (
          <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900 text-sm">{addr.full_name}</p>
            <p className="text-slate-600">{addr.house_street}, {addr.area_locality}</p>
            <p className="text-slate-600">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
            <p className="text-slate-600">Mobile: <strong>+91 {addr.phone}</strong></p>
            {addr.landmark && <p className="text-[11px] text-slate-500">Landmark: {addr.landmark}</p>}
          </div>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-sky-600" />
              <span>Ordered Items ({order.items.length})</span>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{item.product_title || (item as any).title}</p>
                    <p className="text-[11px] text-slate-400">
                      SKU: {item.sku} • Qty: {item.quantity} {item.selected_variant ? `(${item.selected_variant})` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Coupon Discount:</span>
              <span>- ₹{order.discount_amount?.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span>{order.delivery_charge === 0 ? 'FREE' : `₹${order.delivery_charge}`}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
            <span>Total Payable to Courier:</span>
            <span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onNavigate('track-order', { orderNumber: order.order_number, phone: order.customer_phone })}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="w-full sm:w-auto py-3 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
