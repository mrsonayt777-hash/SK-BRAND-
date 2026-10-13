export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  price: number;
  sale_price: number | null;
  stock: number;
  is_featured: number;
  is_active: number;
  variants_json?: string;
  variants?: {
    sizes?: string[];
    colors?: string[];
  } | null;
  images: string[];
  primary_image: string | null;
  created_at: string;
  updated_at?: string;
  related_products?: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    sale_price: number | null;
    stock: number;
    primary_image: string | null;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: number;
  product_count?: number;
  created_at: string;
}

export interface CartItem {
  id: string; // unique item id (e.g. prodId + variant)
  product_id: string;
  title: string;
  sku: string;
  price: number;
  quantity: number;
  selected_variant?: string;
  image: string;
  max_stock: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  house_street: string;
  area_locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  delivery_instructions?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_title: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  selected_variant?: string;
  created_at: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  status: string;
  comment: string;
  changed_by: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  shipping_address_json?: string;
  shipping_address?: ShippingAddress;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  total_amount: number;
  coupon_code?: string | null;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  cancellation_reason?: string | null;
  delivery_instructions?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  history?: OrderStatusHistoryItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  usage_limit: number;
  usage_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: number;
  created_at: string;
}

export interface StoreSettings {
  store_name?: string;
  store_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  business_address?: string;
  delivery_charge?: string;
  free_shipping_threshold?: string;
  cod_enabled?: string;
  online_payment_notice?: string;
  announcement_bar?: string;
  return_window_days?: string;
  cancellation_window_hours?: string;
  [key: string]: string | undefined;
}

export interface CustomerUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer';
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
}
