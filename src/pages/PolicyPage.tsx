import React, { useState } from 'react';
import { Truck, RefreshCw, ShieldCheck, FileText, HelpCircle } from 'lucide-react';

interface PolicyPageProps {
  initialTab?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ initialTab = 'shipping' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabs = [
    { id: 'shipping', label: 'Shipping & COD', icon: Truck },
    { id: 'returns', label: 'Returns & Cancellation', icon: RefreshCw },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'faqs', label: 'Frequently Asked Questions', icon: HelpCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Store Guidelines</span>
        <h1 className="text-3xl font-black font-serif text-slate-950">Policies & Information</h1>
        <p className="text-xs text-slate-500">
          Transparent, customer-first terms for Cash on Delivery, shipping, returns, and data protection.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-slate-950 text-slate-950 font-bold bg-slate-50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs text-xs sm:text-sm text-slate-700 leading-relaxed space-y-6">
        {activeTab === 'shipping' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-serif text-slate-950">Shipping & Cash on Delivery (COD) Policy</h2>
            <p>
              At <strong>SK BRAND</strong>, we strive to deliver our handcrafted apparel and footwear safely and promptly to your doorstep across all serviceable PIN codes throughout India.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">1. Cash on Delivery (COD) Availability</h3>
            <p>
              Cash on Delivery is enabled as our standard payment method. You do not need to provide card details or bank credentials online. When our delivery partner brings your package, you pay the exact invoice amount in cash. Please keep exact change ready where possible.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">2. Delivery Charges & Free Shipping</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Orders valued at <strong>₹1,499 and above</strong> receive <strong>FREE Shipping</strong>.</li>
              <li>For orders under ₹1,499, a flat nominal delivery fee of <strong>₹99</strong> is applied to cover courier and COD logistics handling.</li>
            </ul>

            <h3 className="font-bold text-slate-900 text-sm">3. Dispatch & Delivery Timelines</h3>
            <p>
              Orders are typically confirmed and handed over to our courier partners within 24 to 48 hours. Metro cities generally receive delivery within 3 to 5 business days, while non-metro and remote regions receive delivery within 5 to 7 business days.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">4. Order Tracking</h3>
            <p>
              You can track the real-time status of your parcel directly on our website under the <strong>Track Order</strong> tab using your unique Order Number and mobile number.
            </p>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-serif text-slate-950">Return, Exchange & Cancellation Policy</h2>
            <p>
              We want you to love what you wear. If the size or fit isn&apos;t ideal, we provide a smooth exchange and return process.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">1. 7-Day Return & Size Exchange Window</h3>
            <p>
              Customers may request a return or size exchange within <strong>7 days</strong> of parcel delivery. The product must be unworn, unwashed, and in its original packaging with all tags intact.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">2. Return Procedure for COD Orders</h3>
            <p>
              To initiate a return or exchange, contact our customer service via email at <code>support@skbrand.in</code> or WhatsApp/Call at <code>+91 98765 43210</code> mentioning your Order Number. Since the order was paid via COD, our support team will coordinate bank account or UPI details for refund transfer upon inspection of the returned garment.
            </p>

            <h3 className="font-bold text-slate-900 text-sm">3. Order Cancellation</h3>
            <p>
              You can cancel your order before it has been dispatched from our facility (within 24 hours of placement) without any penalty. Once dispatched, cancellation must be handled via the courier refusal or standard return procedure.
            </p>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-serif text-slate-950">Privacy Policy</h2>
            <p>
              SK BRAND (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personally identifiable information.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">1. Information We Collect</h3>
            <p>
              We collect your name, mobile number, delivery address, PIN code, and email address solely for processing your orders, providing dispatch tracking, and offering customer support. We never sell, rent, or lease customer data to third parties.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">2. Data Security</h3>
            <p>
              All customer records and passwords are protected using industry-standard salted bcrypt cryptographic hashing and secure database constraints.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-serif text-slate-950">Terms and Conditions of Service</h2>
            <p>
              By accessing and placing an order on the SK BRAND website or progressive mobile app, you agree to comply with our conditions of service.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">1. Product Information & Pricing</h3>
            <p>
              All prices are listed in Indian Rupees (₹) inclusive of applicable taxes. We reserve the right to correct typographical errors or revise prices prior to order confirmation.
            </p>
            <h3 className="font-bold text-slate-900 text-sm">2. Prohibited Conduct</h3>
            <p>
              Any fraudulent orders, bogus addresses, or malicious attempts to interfere with our servers or administration consoles will result in immediate IP blacklisting and potential legal recourse.
            </p>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold font-serif text-slate-950">Frequently Asked Questions (FAQ)</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">How does Cash on Delivery work?</h4>
                <p className="text-slate-600">
                  You complete checkout without entering any payment credentials. When our delivery courier arrives at your doorstep, you hand over the cash amount corresponding to the order total.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">Why is Online Payment coming soon?</h4>
                <p className="text-slate-600">
                  We are actively partnering with leading banking partners to introduce UPI, Rupay, and credit cards. Until the multi-bank gateway passes all compliance audits, we keep online payments safely disabled and offer 100% Cash on Delivery.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">Can I install SK BRAND on my Android smartphone?</h4>
                <p className="text-slate-600">
                  Yes! Tap the &quot;Install App&quot; button in our header or browser banner. The application installs directly onto your home screen without taking up large storage.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900">How do I verify the right size?</h4>
                <p className="text-slate-600">
                  Our garment sizes conform to standard Indian measurement tables (38 for M, 40 for L, 42 for XL, etc.). If you have any fit doubts, reach out to our team at support@skbrand.in.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
