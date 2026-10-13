import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface AppliedCoupon {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  discount_amount: number;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  itemCount: number;
  freeShippingThreshold: number;
  standardDeliveryFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('skbrand_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('skbrand_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [deliverySettings, setDeliverySettings] = useState({
    deliveryCharge: 99,
    freeThreshold: 1499
  });

  // Fetch live delivery thresholds from store settings
  useEffect(() => {
    fetch('/api/store/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && (data.delivery_charge || data.free_shipping_threshold)) {
          setDeliverySettings({
            deliveryCharge: data.delivery_charge ? parseFloat(data.delivery_charge) : 99,
            freeThreshold: data.free_shipping_threshold ? parseFloat(data.free_shipping_threshold) : 1499
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('skbrand_cart', JSON.stringify(items));
  }, [items]);

  // Save coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('skbrand_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('skbrand_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity: number = 1, variant?: string) => {
    const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;
    const itemId = `${product.id}_${variant || 'default'}`;

    setItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i);
      } else {
        const newItem: CartItem = {
          id: itemId,
          product_id: product.id,
          title: product.title,
          sku: product.sku,
          price: unitPrice,
          quantity: Math.min(quantity, product.stock),
          selected_variant: variant,
          image: product.primary_image || (product.images && product.images[0]) || '',
          max_stock: product.stock
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(i => {
        if (i.id === id) {
          return { ...i, quantity: Math.min(quantity, i.max_stock) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recalculate discount based on current subtotal
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discount_value, subtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const deliveryCharge = subtotal === 0 ? 0 : (subtotal >= deliverySettings.freeThreshold ? 0 : deliverySettings.deliveryCharge);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal })
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }

      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: data.discount_amount,
        message: data.message
      });
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Failed to validate coupon. Please check connection.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        subtotal,
        discountAmount,
        deliveryCharge,
        totalAmount,
        itemCount,
        freeShippingThreshold: deliverySettings.freeThreshold,
        standardDeliveryFee: deliverySettings.deliveryCharge
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
