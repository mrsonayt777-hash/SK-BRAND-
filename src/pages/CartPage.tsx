import React, { useState } from 'react';
import { Trash2, ArrowRight, Tag, ShieldCheck, Truck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    deliveryCharge,
    totalAmount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    freeShippingThreshold,
    standardDeliveryFee
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponFeedback(null);
    const result = await applyCouponCode(couponInput);
    setCouponFeedback(result);
    setCouponLoading(false);
    if (result.success) setCouponInput('');
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-serif text-slate-950">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t added any items to your bag yet. Browse our handcrafted collection and discover traditional Indian fashion.
          </p>
        </div>
        <button
          onClick={() => onNavigate('products')}
          className="px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Shopping Bag</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items and proceed to Cash on Delivery checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        {/* Left 2 Cols: Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-800 font-medium">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                {amountNeededForFreeShipping === 0 ? (
                  <strong className="text-emerald-700">Congratulations! You unlocked Free Delivery.</strong>
                ) : (
                  <span>Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for Free Shipping</span>
                )}
              </span>
              <span className="text-[11px] text-slate-500">Threshold: ₹{freeShippingThreshold.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-sky-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-4 sm:gap-5 items-start">
                <div className="w-20 sm:w-24 aspect-4/5 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.selected_variant && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.selected_variant}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-0.5">SKU: {item.sku}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-50">
                    {/* Quantity Stepper */}
                    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-slate-900 min-w-8 text-center bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_stock}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold text-slate-950 font-sans">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <button
              onClick={() => onNavigate('products')}
              className="font-semibold text-slate-900 hover:underline cursor-pointer"
            >
              ← Continue Shopping
            </button>
            <span>All items are 100% genuine and verified</span>
          </div>
        </div>

        {/* Right 1 Col: Summary & Coupons */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
              <Tag className="w-4 h-4 text-sky-600" />
              <span>Apply Discount Coupon</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {appliedCoupon.code} Applied
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Savings: ₹{discountAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs uppercase font-semibold text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {couponFeedback && (
                  <p className={`text-[11px] ${couponFeedback.success ? 'text-emerald-700' : 'text-red-600'}`}>
                    {couponFeedback.message}
                  </p>
                )}

                <div className="pt-1 text-[11px] text-slate-400">
                  Try <strong>WELCOME10</strong> (10% off on ₹999+) or <strong>FESTIVE200</strong> (₹200 flat off on ₹1,499+)
                </div>
              </form>
            )}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs text-xs">
            <h2 className="font-black font-serif text-slate-950 text-base pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span>Product Subtotal</span>
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
                    <span className="font-semibold text-slate-900">₹{standardDeliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Payment Method</span>
                <span className="font-bold text-slate-800">Cash on Delivery (COD)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-sm">Total Payable</span>
              <span className="font-black text-xl text-slate-950 font-sans">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pay in cash when parcel reaches your doorstep
              </p>
              <p>7-day easy exchange and return guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
