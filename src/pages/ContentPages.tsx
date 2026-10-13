import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', order_number: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Customer Support</span>
        <h1 className="text-3xl font-black font-serif text-slate-950">Contact SK BRAND</h1>
        <p className="text-xs text-slate-500">
          Have an inquiry about an upcoming order, size exchange, or Cash on Delivery service? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>Direct Phone & WhatsApp</span>
            </div>
            <p className="text-slate-600">+91 98765 43210</p>
            <p className="text-[11px] text-slate-400">Monday - Saturday (10:00 AM - 7:00 PM IST)</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Email Support</span>
            </div>
            <p className="text-slate-600">support@skbrand.in</p>
            <p className="text-[11px] text-slate-400">Response within 24 business hours</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Headquarters Studio</span>
            </div>
            <p className="text-slate-600">
              SK Brand Studio, 42 Heritage Plaza, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Message Received</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for contacting SK BRAND. Our customer executive will review your inquiry and get in touch with you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Send an Inquiry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rajesh Kumar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800">Order Number (if inquiring about order)</label>
                  <input
                    type="text"
                    placeholder="e.g. SKB-2026-123456"
                    value={formData.order_number}
                    onChange={e => setFormData({ ...formData, order_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us how we can assist you..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Our Heritage</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-950">About SK BRAND</h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Founded with a passion for Indian artisan craftsmanship, SK BRAND bridges timeless regional silhouettes with contemporary elegance.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
        <div className="aspect-16/9 rounded-xl overflow-hidden mb-6">
          <img
            src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1200&q=80"
            alt="SK BRAND Artisans"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl font-bold font-serif text-slate-950">The Soul of Indian Textiles</h2>
        <p>
          In an era of mass synthetic garments, <strong>SK BRAND</strong> was born out of an appreciation for natural fibres, handloom textures, and traditional tailoring. From the royal drape of Lucknowi chikankari to the textured warmth of raw silk and hand-burnished leather juttis, every creation in our boutique tells an authentic Indian story.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">Our Core Principles</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Pure Materiality:</strong> We select combed cotton, slub weaves, natural linens, and pure silk blends that offer superior comfort across India&apos;s diverse climates.</li>
          <li><strong>Authentic Fair Pricing:</strong> By designing directly and fulfilling straight from our workshop to your home, we deliver artisanal quality without boutique markups.</li>
          <li><strong>100% Cash on Delivery Trust:</strong> We believe in unconditional customer trust. You pay only when the garment arrives at your doorstep.</li>
        </ul>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900">Experience SK BRAND</p>
            <p className="text-slate-500 text-xs">Explore our newly launched festive & daily catalog</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-2.5 bg-slate-950 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition"
          >
            Shop Collections
          </button>
        </div>
      </div>
    </div>
  );
};
