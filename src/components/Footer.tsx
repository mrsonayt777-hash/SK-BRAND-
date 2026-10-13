import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Award, Lock, MapPin, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-700 text-xs mt-16 pb-16 sm:pb-8">
      {/* Trust Badges Bar */}
      <div className="border-b border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Cash on Delivery</p>
                <p className="text-slate-500 text-[11px]">Pay when it arrives at your doorstep</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Authentic Quality</p>
                <p className="text-slate-500 text-[11px]">Handcrafted pure fabrics & trims</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">7-Day Easy Returns</p>
                <p className="text-slate-500 text-[11px]">Hassle-free size exchange & return</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Verified Deliveries</p>
                <p className="text-slate-500 text-[11px]">Reliable pan-India courier network</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex flex-col items-center justify-center text-white">
                <span className="text-xs font-black">SK</span>
                <span className="text-[6px] font-bold text-sky-400">BRAND</span>
              </div>
              <span className="text-lg font-black font-serif tracking-tight text-slate-950">SK BRAND</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs max-w-sm">
              SK BRAND celebrates authentic Indian apparel, royal festive wear, and modern everyday essentials. Combining traditional loom techniques with tailored contemporary silhouettes.
            </p>
            <div className="space-y-2 text-slate-600 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>SK Brand Studio, 42 Heritage Plaza, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+91 98765 43210 (Mon - Sat, 10 AM - 7 PM IST)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>support@skbrand.in</span>
              </p>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Shop Collections</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('products', { category: 'mens-ethnic' })} className="hover:text-slate-950 transition cursor-pointer">
                  Men&apos;s Ethnic Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'shirts-casuals' })} className="hover:text-slate-950 transition cursor-pointer">
                  Shirts & Casuals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'jackets-blazers' })} className="hover:text-slate-950 transition cursor-pointer">
                  Jackets & Blazers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'footwear-mojaris' })} className="hover:text-slate-950 transition cursor-pointer">
                  Footwear & Mojaris
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products', { category: 'womens-festive' })} className="hover:text-slate-950 transition cursor-pointer">
                  Festive Sarees & Kurtis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('products')} className="hover:text-slate-950 font-semibold transition cursor-pointer">
                  View All Products →
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-slate-950 transition cursor-pointer">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-slate-950 transition cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-slate-950 transition cursor-pointer">
                  About SK BRAND
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', { tab: 'shipping' })} className="hover:text-slate-950 transition cursor-pointer">
                  Shipping & COD Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', { tab: 'returns' })} className="hover:text-slate-950 transition cursor-pointer">
                  Return & Cancellation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', { tab: 'faqs' })} className="hover:text-slate-950 transition cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Policies & Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('policy', { tab: 'privacy' })} className="hover:text-slate-950 transition cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('policy', { tab: 'terms' })} className="hover:text-slate-950 transition cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li className="pt-2">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold mb-1">
                    <Lock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Store Administration</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Restricted owner & management dashboard</p>
                  <button
                    onClick={() => onNavigate('admin-login')}
                    className="w-full text-center py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded text-[11px] transition cursor-pointer"
                  >
                    Owner Admin Login
                  </button>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} SK BRAND. All Rights Reserved. Handcrafted in India.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Cash on Delivery (COD) Active</span>
            <span>·</span>
            <span>Made with precision for Android & Web</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
