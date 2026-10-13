import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultCatalog';
import { ArrowRight } from 'lucide-react';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>(() => DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setCategories(data); })
      .catch(err => console.warn(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Heritage & Modern Fashion</span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-950">Shop by Category</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Explore SK BRAND&apos;s curated collections spanning royal ethnic attire, tailored daywear, footwear, and festive accessories.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-slate-100 rounded-2xl h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex flex-col justify-end p-6 text-white cursor-pointer shadow-md hover:shadow-xl transition"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  {cat.product_count || 0} Products
                </span>
                <h2 className="text-xl font-bold font-serif leading-tight group-hover:text-sky-300 transition">
                  {cat.name}
                </h2>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
