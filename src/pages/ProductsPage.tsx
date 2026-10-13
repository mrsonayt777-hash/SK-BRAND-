import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../data/defaultCatalog';

interface ProductsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialParams?: Record<string, string>;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ onNavigate, initialParams = {} }) => {
  const [products, setProducts] = useState<Product[]>(() => DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(() => DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category || '');
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.search || '');
  const [sortOption, setSortOption] = useState<string>(initialParams.sort || 'newest');
  const [priceRange, setPriceRange] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(DEFAULT_PRODUCTS.length);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setCategories(data); })
      .catch(() => {});
  }, []);

  // Update filters if initialParams changes
  useEffect(() => {
    if (initialParams.category !== undefined) setSelectedCategory(initialParams.category);
    if (initialParams.search !== undefined) setSearchQuery(initialParams.search);
    if (initialParams.sort !== undefined) setSortOption(initialParams.sort);
  }, [initialParams]);

  // Fetch products matching filters
  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('search', searchQuery);
    if (sortOption) params.append('sort', sortOption);
    params.append('page', page.toString());
    params.append('limit', '12');

    if (priceRange === 'under1500') {
      params.append('max_price', '1500');
    } else if (priceRange === '1500-2500') {
      params.append('min_price', '1500');
      params.append('max_price', '2500');
    } else if (priceRange === 'above2500') {
      params.append('min_price', '2500');
    }

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total || 0);
        }
      })
      .catch(err => console.error('Failed to fetch products:', err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, sortOption, priceRange, page]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortOption('newest');
    setPriceRange('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
            {selectedCategory
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
              : searchQuery
              ? `Search: "${searchQuery}"`
              : 'All Products'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {totalCount} authentic pieces • All available with Cash on Delivery
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortOption}
              onChange={e => { setSortOption(e.target.value); setPage(1); }}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-slate-900 transition cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="oldest">Classic Releases</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 pr-4 border-r border-slate-200 text-xs">
          {/* Active filter summary */}
          {(selectedCategory || priceRange || searchQuery) && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Active Filters</span>
                <button
                  onClick={handleResetFilters}
                  className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] text-slate-700">
                    Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3 text-slate-400" /></button>
                  </span>
                )}
                {priceRange && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] text-slate-700">
                    Price: {priceRange}
                    <button onClick={() => setPriceRange('')}><X className="w-3 h-3 text-slate-400" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded text-[11px] text-slate-700">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-slate-400" /></button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Search within page */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Search Catalog</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Keywords, fabrics, colors..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-slate-900 transition"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`w-full text-left py-1.5 px-2 rounded-md transition cursor-pointer flex items-center justify-between ${
                  selectedCategory === '' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
                <span>{totalCount}</span>
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategory(c.slug); setPage(1); }}
                  className={`w-full text-left py-1.5 px-2 rounded-md transition cursor-pointer flex items-center justify-between ${
                    selectedCategory === c.slug ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.product_count !== undefined && (
                    <span className="text-[10px] opacity-70">({c.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Price Range</h3>
            <div className="space-y-1">
              {[
                { label: 'All Prices', val: '' },
                { label: 'Under ₹1,500', val: 'under1500' },
                { label: '₹1,500 - ₹2,500', val: '1500-2500' },
                { label: 'Above ₹2,500', val: 'above2500' },
              ].map(opt => (
                <label key={opt.val} className="flex items-center gap-2 py-1 px-1 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === opt.val}
                    onChange={() => { setPriceRange(opt.val); setPage(1); }}
                    className="accent-slate-900"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-slate-100 rounded-xl aspect-3/4" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✕
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any items matching your current filters. Try resetting the filters or searching with different terms.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200 text-xs">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <div className="px-3 py-1.5 font-semibold text-slate-900">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between text-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Filter className="w-4 h-4" /> Filters
                </h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category Select */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Categories</p>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); }}
                    className={`w-full text-left py-1.5 px-2 rounded-md ${selectedCategory === '' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCategory(c.slug); setPage(1); }}
                      className={`w-full text-left py-1.5 px-2 rounded-md ${selectedCategory === c.slug ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price Range */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Price Range</p>
                <div className="space-y-1">
                  {[
                    { label: 'All Prices', val: '' },
                    { label: 'Under ₹1,500', val: 'under1500' },
                    { label: '₹1,500 - ₹2,500', val: '1500-2500' },
                    { label: 'Above ₹2,500', val: 'above2500' },
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-2 py-1 text-slate-700">
                      <input
                        type="radio"
                        name="mobilePriceRange"
                        checked={priceRange === opt.val}
                        onChange={() => { setPriceRange(opt.val); setPage(1); }}
                        className="accent-slate-900"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
