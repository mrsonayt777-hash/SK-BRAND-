import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, ShieldCheck, RefreshCw, Check, ArrowLeft, MapPin } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

import { DEFAULT_PRODUCTS } from '../data/defaultCatalog';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(() => {
    return DEFAULT_PRODUCTS.find(p => p.id === productId || p.slug === productId) || null;
  });
  const [selectedImage, setSelectedImage] = useState<string>(() => {
    const initial = DEFAULT_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    return initial?.primary_image || (initial?.images && initial.images[0]) || '';
  });
  const [selectedSize, setSelectedSize] = useState<string>(() => {
    const initial = DEFAULT_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    return initial?.variants?.sizes?.[0] || '';
  });
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    const initial = DEFAULT_PRODUCTS.find(p => p.id === productId || p.slug === productId);
    return initial?.variants?.colors?.[0] || '';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        } else if (data.primary_image) {
          setSelectedImage(data.primary_image);
        }
        if (data.variants?.sizes && data.variants.sizes.length > 0) {
          setSelectedSize(data.variants.sizes[0]);
        }
        if (data.variants?.colors && data.variants.colors.length > 0) {
          setSelectedColor(data.variants.colors[0]);
        }
      })
      .catch(() => {
        // Fallback already assigned in initial state
      });
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-4/5 bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-6 w-1/4 bg-slate-200 rounded" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for is currently unavailable.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const hasSale = product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.price;
  const currentPrice = hasSale ? product.sale_price! : product.price;
  const discountPercent = hasSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;
  const isOutOfStock = product.stock <= 0;

  const currentVariantString = [
    selectedSize ? `Size: ${selectedSize}` : null,
    selectedColor ? `Color: ${selectedColor}` : null
  ].filter(Boolean).join(' • ');

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, currentVariantString);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, currentVariantString);
    onNavigate('checkout');
  };

  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pinInput.trim())) {
      setPinStatus('Eligible for Free Delivery & Cash on Delivery (COD) in 3-5 business days.');
    } else {
      setPinStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
      {/* Back button */}
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to catalogue</span>
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery & Zoom Preview */}
        <div className="space-y-4">
          <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            <img
              src={selectedImage || product.primary_image || ''}
              alt={product.title}
              className="w-full h-full object-cover object-top"
            />
            {hasSale && (
              <span className="absolute top-4 left-4 bg-slate-950 text-white text-xs font-bold px-2.5 py-1 rounded">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-slate-950 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.title} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          {/* Category & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{product.category_name || 'SK BRAND Collection'}</span>
              <span>•</span>
              <span>SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Price & Savings */}
          <div className="flex items-baseline gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-sans">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasSale && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  You Save ₹{(product.price - product.sale_price!).toLocaleString('en-IN')} ({discountPercent}%)
                </span>
              </>
            )}
          </div>

          {/* Inventory Stock Status */}
          <div className="text-xs">
            {isOutOfStock ? (
              <span className="font-bold text-red-600">Currently Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Only {product.stock} units left in stock! Hurry up.
              </span>
            ) : (
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                In Stock & Ready to Dispatch ({product.stock} units)
              </span>
            )}
          </div>

          {/* Variant Selectors: Sizes */}
          {product.variants?.sizes && product.variants.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Select Size:</span>
                <span className="text-slate-500 font-medium">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((sz: string) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      selectedSize === sz
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-300 text-slate-700 hover:border-slate-900 bg-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selectors: Colors */}
          {product.variants?.colors && product.variants.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Select Color / Finish:</span>
                <span className="text-slate-500 font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.colors.map((col: string) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      selectedColor === col
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-300 text-slate-700 hover:border-slate-900 bg-white'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-900">Quantity:</span>
            <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={isOutOfStock || quantity <= 1}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-bold text-slate-900 min-w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                disabled={isOutOfStock || quantity >= product.stock}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white border-slate-950 text-slate-950 hover:bg-slate-50 active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-950 hover:bg-slate-900 text-white active:scale-98'
                }`}
              >
                <span>Buy Now (Cash on Delivery)</span>
              </button>
            </div>

            {/* Added notice toast */}
            {addedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900 animate-fadeIn">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Item successfully added to your cart!
                </span>
                <button
                  onClick={() => onNavigate('cart')}
                  className="font-bold underline text-emerald-900 hover:text-emerald-700 cursor-pointer"
                >
                  View Cart
                </button>
              </div>
            )}
          </div>

          {/* Indian PIN Code Delivery Checker */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Check Delivery & Cash on Delivery Availability</span>
            </div>
            <form onSubmit={handleCheckPin} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 560001)"
                value={pinInput}
                maxLength={6}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer text-xs"
              >
                Check
              </button>
            </form>
            {pinStatus && (
              <p className={`text-[11px] font-medium pt-1 ${pinStatus.includes('Eligible') ? 'text-emerald-700' : 'text-red-600'}`}>
                {pinStatus}
              </p>
            )}
          </div>

          {/* Description & Details */}
          <div className="space-y-4 pt-4 border-t border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Product Description</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Cash on Delivery active</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Handmade Indian Craft</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-sky-600 shrink-0" />
                <span>7-Day Size Exchange</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Dispatch within 24-48 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related_products && product.related_products.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Complete the Look</span>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-950 mt-1">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {product.related_products.map(rel => (
              <div
                key={rel.id}
                onClick={() => onNavigate('product-detail', { id: rel.slug || rel.id })}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
              >
                <div className="aspect-4/5 w-full bg-slate-100 overflow-hidden">
                  <img src={rel.primary_image || ''} alt={rel.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs text-slate-900 line-clamp-1">{rel.title}</p>
                  <p className="font-bold text-xs text-slate-950 mt-1">₹{rel.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
