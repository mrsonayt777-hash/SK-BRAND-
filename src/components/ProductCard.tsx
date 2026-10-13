import React from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const [addedAnimation, setAddedAnimation] = React.useState(false);

  const hasSale = product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.price;
  const currentPrice = hasSale ? product.sale_price! : product.price;
  const discountPercent = hasSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div
      onClick={() => onNavigate('product-detail', { id: product.slug || product.id })}
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative aspect-4/5 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.primary_image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {hasSale && (
            <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-sm tracking-wide">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured === 1 && (
            <span className="bg-sky-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
              Featured
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick View overlay button */}
        <div className="absolute inset-x-0 bottom-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition ${
              isOutOfStock
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-white/95 text-slate-900 hover:bg-slate-900 hover:text-white backdrop-blur-xs'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added to Cart</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details (conforming to clean unboxed typography discipline) */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-[11px] text-slate-500 font-medium truncate mb-1">
            {product.category_name || 'SK BRAND Collection'}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-sky-600 transition">
            {product.title}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-950 font-sans">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasSale && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">Cash on Delivery Available</p>
          </div>

          {/* Mobile add button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="sm:hidden p-2 rounded-lg bg-slate-900 text-white disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 transition"
            aria-label="Add to cart"
          >
            {addedAnimation ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
