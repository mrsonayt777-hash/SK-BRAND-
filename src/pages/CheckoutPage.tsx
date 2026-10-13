import React, { useState } from 'react';
import { ShieldCheck, Truck, CreditCard, AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOrderSuccess: (orderData: any) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, discountAmount, deliveryCharge, totalAmount, appliedCoupon, clearCart } = useCart();
  const { customerUser } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: customerUser?.full_name || '',
    customer_email: customerUser?.email || '',
    customer_phone: customerUser?.phone || '',
    house_street: '',
    area_locality: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
    delivery_instructions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your bag is empty</h2>
        <p className="text-xs text-slate-500">Add products before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.customer_name.trim() || formData.customer_name.trim().length < 2) {
      errs.customer_name = 'Please enter your full name.';
    }

    const cleanPhone = formData.customer_phone.replace(/[\s-]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.customer_phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (formData.customer_email && !formData.customer_email.includes('@')) {
      errs.customer_email = 'Please enter a valid email address.';
    }

    if (!formData.house_street.trim()) {
      errs.house_street = 'House No., Building, or Street is required.';
    }

    if (!formData.area_locality.trim()) {
      errs.area_locality = 'Area, Sector, or Locality is required.';
    }

    if (!formData.city.trim()) {
      errs.city = 'City or District is required.';
    }

    if (!formData.state) {
      errs.state = 'State is required.';
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Please enter a valid 6-digit Indian PIN code.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...formData,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          selected_variant: i.selected_variant || ''
        })),
        coupon_code: appliedCoupon?.code || null
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      // Order created successfully
      clearCart();
      onOrderSuccess(data.order);
      onNavigate('order-success', { orderNumber: data.order.order_number });
    } catch (err: any) {
      setServerError(err.message || 'Network error occurred while creating order.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Bag</span>
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details for Cash on Delivery dispatch
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Order Submission Notice</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left 2 Cols: Delivery Form & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Customer & Delivery Address */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="font-bold text-slate-900 text-sm">Delivery Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-800">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.customer_name}
                  onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.customer_name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.customer_name && <p className="text-[11px] text-red-600">{errors.customer_name}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Mobile Number (for COD verification) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-xs">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.customer_phone}
                    onChange={e => setFormData({ ...formData, customer_phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full bg-slate-50 border rounded-lg pl-11 pr-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                      errors.customer_phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.customer_phone && <p className="text-[11px] text-red-600">{errors.customer_phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Email Address (Optional for invoice)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.customer_email}
                  onChange={e => setFormData({ ...formData, customer_email: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.customer_email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.customer_email && <p className="text-[11px] text-red-600">{errors.customer_email}</p>}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-800">House No., Flat, Building, Street *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Royal Residency, 4th Cross"
                  value={formData.house_street}
                  onChange={e => setFormData({ ...formData, house_street: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.house_street ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.house_street && <p className="text-[11px] text-red-600">{errors.house_street}</p>}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-800">Area, Locality, Sector *</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Stage 2"
                  value={formData.area_locality}
                  onChange={e => setFormData({ ...formData, area_locality: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.area_locality ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.area_locality && <p className="text-[11px] text-red-600">{errors.area_locality}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">City / District *</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.city ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-red-600">{errors.city}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">State *</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="text-[11px] text-red-600">{errors.state}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="560038"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 ${
                    errors.pincode ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.pincode && <p className="text-[11px] text-red-600">{errors.pincode}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near BDA Complex"
                  value={formData.landmark}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-800">Delivery Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please call before arriving or deliver between 2 PM and 6 PM"
                  value={formData.delivery_instructions}
                  onChange={e => setFormData({ ...formData, delivery_instructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="font-bold text-slate-900 text-sm">Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Active Cash on Delivery Option */}
              <div className="p-4 rounded-xl border-2 border-slate-950 bg-slate-50/50 flex items-start gap-3">
                <input
                  type="radio"
                  name="payment_method"
                  checked={true}
                  readOnly
                  className="mt-1 accent-slate-950 w-4 h-4 cursor-pointer"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-sky-600" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Pay in cash when our trusted courier delivers the package to your address. No card or digital payments required prior to delivery.
                  </p>
                </div>
              </div>

              {/* Disabled Online Payment with mandated message */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-100/60 opacity-80 flex items-start gap-3">
                <input
                  type="radio"
                  name="payment_method"
                  disabled
                  className="mt-1 opacity-40 w-4 h-4"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      UPI / Cards / Net Banking
                    </span>
                    <span className="bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide">
                      Online Payment — Coming Soon
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Online Payment — Coming Soon. Digital payment options are temporarily disabled while we upgrade our multi-bank gateway. Please use Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place Order Button */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs text-xs">
            <h2 className="font-black font-serif text-slate-950 text-base pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h2>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-14 object-cover rounded bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-slate-500">
                      Qty: {item.quantity} {item.selected_variant ? `• ${item.selected_variant}` : ''}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{deliveryCharge}</span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Payable on COD</span>
              <span className="font-black text-xl text-slate-950 font-sans">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>Place Order (Cash on Delivery)</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 space-y-1.5 pt-2">
              <p className="flex items-center gap-1.5 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                By clicking Place Order, you confirm your Cash on Delivery parcel booking.
              </p>
              <p>Duplicate order protection active.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
