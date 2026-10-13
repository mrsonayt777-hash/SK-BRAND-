import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Tag, ShieldCheck, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category, StoreSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/defaultCatalog';
import { BackendSetupBanner } from '../components/BackendSetupBanner';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() =>
    DEFAULT_PRODUCTS.filter(p => p.is_featured === 1)
  );
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(() => DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch live data from backend API
    Promise.all([
      fetch('/api/products?featured=1&limit=8').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/products?limit=8').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/categories').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/store/settings').then(r => r.ok ? r.json() : null).catch(() => null)
    ])
      .then(([featuredData, recentData, catsData, settingsData]) => {
        if (featuredData && Array.isArray(featuredData.products) && featuredData.products.length > 0) {
          setFeaturedProducts(featuredData.products);
        }
        if (recentData && Array.isArray(recentData.products) && recentData.products.length > 0) {
          setRecentProducts(recentData.products);
        }
        if (Array.isArray(catsData) && catsData.length > 0) {
          setCategories(catsData);
        }
        if (settingsData && typeof settingsData === 'object') {
          setSettings(settingsData);
        }
      })
      .catch(err => {
        console.warn('Live API fetch skipped or errored; using default catalog:', err);
      });
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16">
      <BackendSetupBanner />

      {/* 1. Hero Banner */}
      <section className="relative bg-slate-950 text-white overflow-hidden rounded-2xl mx-4 sm:mx-6 lg:mx-8 mt-2 sm:mt-4">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Festive & Everyday Indian Wear</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-tight">
              Timeless Elegance. <br />
              <span className="text-sky-400">Pure Indian Craft.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Discover SK BRAND&apos;s handcrafted collection of pure slub cotton kurtas, raw silk Nehru jackets, tailored shirts, and artisanal footwear. Order with 100% Cash on Delivery across India.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigate('products')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Shop New Arrivals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('products', { category: 'mens-ethnic' })}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition flex items-center justify-center cursor-pointer"
              >
                Men&apos;s Ethnic Collection
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Cash on Delivery Available
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Free Shipping Above ₹1,499
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> 7-Day Easy Returns
              </span>
            </div>
          </div>

          {/* Hero Featured Collage */}
          <div className="relative w-full max-w-md lg:max-w-lg aspect-4/3 sm:aspect-1/1 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1000&q=80"
              alt="SK BRAND Festive Collection"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-white w-full">
                <p className="text-xs uppercase tracking-wider text-sky-300 font-bold">Featured Drop</p>
                <p className="text-base font-bold">Royal Indigo Hand-Embroidered Kurta</p>
                <p className="text-xs text-slate-200 mt-1">Starting from ₹1,899 • Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop By Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Curated Collections</span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 mt-1">Shop by Category</h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-3/4 flex flex-col justify-end p-3 sm:p-4 text-white cursor-pointer shadow-xs hover:shadow-md transition"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-bold text-xs sm:text-sm leading-tight text-white group-hover:text-sky-300 transition">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-300 mt-0.5">Explore →</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Handpicked For You</span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 mt-1">Featured Creations</h2>
          </div>
          <button
            onClick={() => onNavigate('products', { featured: '1' })}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-100 rounded-xl aspect-3/4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Banner with Active Coupons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>Special Introductory Discounts</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black font-serif">
              Save on your first SK BRAND order
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg">
              Apply valid coupon code at checkout:
              <strong className="text-white ml-1">WELCOME10</strong> for 10% off (min ₹999) or
              <strong className="text-white ml-1">FESTIVE200</strong> for ₹200 off (min ₹1,499).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">Coupon Code</p>
              <p className="text-base font-black text-sky-400 tracking-wider">WELCOME10</p>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Shop Now & Apply
            </button>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals & Latest Additions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Fresh From The Loom</span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 mt-1">New Arrivals</h2>
          </div>
          <button
            onClick={() => onNavigate('products', { sort: 'newest' })}
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map(product => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 6. Why Choose SK BRAND */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">The SK BRAND Difference</span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
              Why Customers Across India Trust Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Designed with integrity, tailored with patience, and delivered with genuine Cash on Delivery peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold">
                <Truck className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pan-India Cash on Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Shop with zero hesitation. No upfront bank transfer or digital payment needed—simply inspect your parcel and pay the delivery courier in cash upon arrival.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Hand-Selected Fabrics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every thread is selected for breathability in Indian climates—from combed pure cotton to raw silk blends, tested for shrinkage resistance and durable colors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">7-Day Easy Exchange & Return</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If the size isn&apos;t just right or you desire a different shade, our customer support team facilitates a prompt replacement or pickup within 7 days of delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
