import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skbrand-super-secret-key-2026';

// Setup Multer for product image uploads
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, `prod-${uniqueSuffix}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

// Helper for generating order numbers
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `SKB-${year}-${randomPart}`;
}

// Log admin activities
function logAdminActivity(adminId: string, action: string, entityType: string, entityId: string, details: string, req: Request) {
  try {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO admin_activity_logs (id, admin_id, action, entity_type, entity_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, adminId, action, entityType, entityId, details, ip, now]
    );
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

// Auth Middleware
export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  full_name: string;
}

export function authenticateToken(req: Request & { user?: AuthUser }, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    next();
  }
}

export function requireAdmin(req: Request & { user?: AuthUser }, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please login as admin.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    // Verify user exists and is still admin in DB
    const profile = db.queryOne<{ id: string; role: string }>('SELECT id, role FROM profiles WHERE id = ?', [decoded.id]);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator account revoked or invalid.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireCustomer(req: Request & { user?: AuthUser }, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Please login to access your customer account.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// ==========================================
// 1. PUBLIC STOREFRONT ENDPOINTS
// ==========================================

// Get public store settings
router.get('/store/settings', (_req, res) => {
  try {
    const rows = db.query<{ key: string; value: string }>('SELECT key, value FROM store_settings');
    const settings: Record<string, string> = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get active categories
router.get('/categories', (_req, res) => {
  try {
    const categories = db.query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
       FROM categories c
       WHERE c.is_active = 1
       ORDER BY c.display_order ASC, c.name ASC`
    );
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Browse products with search, category, sort, and pagination
router.get('/products', (req, res) => {
  try {
    const { category, search, sort, featured, min_price, max_price, page = '1', limit = '12' } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (featured === '1' || featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.sku) LIKE ?)`;
      params.push(term, term, term);
    }

    if (min_price) {
      query += ` AND (CASE WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN p.sale_price ELSE p.price END) >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND (CASE WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN p.sale_price ELSE p.price END) <= ?`;
      params.push(Number(max_price));
    }

    // Sort order
    if (sort === 'price-low') {
      query += ` ORDER BY (CASE WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN p.sale_price ELSE p.price END) ASC`;
    } else if (sort === 'price-high') {
      query += ` ORDER BY (CASE WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 THEN p.sale_price ELSE p.price END) DESC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY p.created_at ASC`;
    } else {
      // Default: newest & featured first
      query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
    }

    const allMatching = db.query(query, params);
    const totalCount = allMatching.length;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const offset = (pageNum - 1) * pageSize;

    const pagedProducts = allMatching.slice(offset, offset + pageSize);

    // Attach primary images & gallery
    const productsWithImages = pagedProducts.map(prod => {
      const images = db.query<{ image_url: string; is_primary: number }>(
        `SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC`,
        [prod.id]
      );
      return {
        ...prod,
        images: images.map(img => img.image_url),
        primary_image: images.length > 0 ? images[0].image_url : null,
        variants: prod.variants_json ? JSON.parse(prod.variants_json) : null
      };
    });

    res.json({
      products: productsWithImages,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single product details
router.get('/products/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const product = db.queryOne<any>(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1`,
      [slugOrId, slugOrId]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found or currently unavailable.' });
    }

    const images = db.query<{ id: string; image_url: string; is_primary: number }>(
      `SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC`,
      [product.id]
    );

    // Get related products in the same category
    const related = db.query(
      `SELECT id, title, slug, price, sale_price, stock FROM products
       WHERE category_id = ? AND id != ? AND is_active = 1
       LIMIT 4`,
      [product.category_id, product.id]
    ).map(rel => {
      const relImg = db.queryOne<{ image_url: string }>(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY is_primary DESC LIMIT 1',
        [rel.id]
      );
      return { ...rel, primary_image: relImg ? relImg.image_url : null };
    });

    res.json({
      ...product,
      images: images.map(i => i.image_url),
      image_records: images,
      primary_image: images.length > 0 ? images[0].image_url : null,
      variants: product.variants_json ? JSON.parse(product.variants_json) : null,
      related_products: related
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Validate coupon code
router.post('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.queryOne<any>(
      'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
      [cleanCode]
    );

    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'Invalid coupon code.' });
    }

    const now = new Date().toISOString().split('T')[0];
    if (coupon.start_date && coupon.start_date > now) {
      return res.status(400).json({ valid: false, message: 'This coupon offer has not started yet.' });
    }

    if (coupon.end_date && coupon.end_date < now) {
      return res.status(400).json({ valid: false, message: 'This coupon code has expired.' });
    }

    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.min_order_value} required to use coupon ${cleanCode}.`
      });
    }

    if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit has been reached.' });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percent') {
      discountAmount = (orderSubtotal * coupon.discount_value) / 100;
      if (coupon.max_discount > 0 && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      // Fixed discount
      discountAmount = Math.min(coupon.discount_value, orderSubtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount,
      message: `Coupon ${coupon.code} applied successfully! You saved ₹${discountAmount}.`
    });
  } catch (err: any) {
    res.status(500).json({ valid: false, message: err.message });
  }
});

// Create COD Order (Secure server-side recalculation & atomic inventory decrement)
router.post('/orders', (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      house_street,
      area_locality,
      city,
      state,
      pincode,
      landmark,
      delivery_instructions,
      items,
      coupon_code
    } = req.body;

    // Validate customer inputs
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }

    const cleanPhone = (customer_phone || '').toString().trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    if (!house_street || !area_locality || !city || !state) {
      return res.status(400).json({ error: 'Please fill in complete address details (House/Street, Area, City, State).' });
    }

    const cleanPincode = (pincode || '').toString().trim();
    if (!/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please add items to checkout.' });
    }

    // Atomic transaction for order placement & stock decrement
    const createdOrder = db.transaction(() => {
      let subtotal = 0;
      const orderItemsToInsert: Array<{
        product_id: string;
        title: string;
        sku: string;
        unit_price: number;
        quantity: number;
        subtotal: number;
        variant: string;
      }> = [];

      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0) {
          throw new Error('Invalid cart item detected.');
        }

        const qty = parseInt(item.quantity, 10);
        // Fetch current active product directly from DB
        const product = db.queryOne<any>('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (!product) {
          throw new Error(`Product not found: ${item.product_id}`);
        }

        if (product.is_active !== 1) {
          throw new Error(`Product "${product.title}" is currently unavailable.`);
        }

        if (product.stock < qty) {
          throw new Error(
            `Insufficient stock for "${product.title}". Requested: ${qty}, Available: ${product.stock}. Please adjust quantity.`
          );
        }

        // Use authoritative server price (sale_price if valid, else regular price)
        const unitPrice = (product.sale_price && product.sale_price > 0 && product.sale_price < product.price)
          ? product.sale_price
          : product.price;

        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        orderItemsToInsert.push({
          product_id: product.id,
          title: product.title,
          sku: product.sku,
          unit_price: unitPrice,
          quantity: qty,
          subtotal: lineTotal,
          variant: item.selected_variant || ''
        });

        // Decrement stock atomically
        db.run('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?', [
          qty,
          new Date().toISOString(),
          product.id
        ]);
      }

      // Fetch delivery settings
      const deliveryChargeSetting = db.queryOne<{ value: string }>('SELECT value FROM store_settings WHERE key = "delivery_charge"');
      const freeThresholdSetting = db.queryOne<{ value: string }>('SELECT value FROM store_settings WHERE key = "free_shipping_threshold"');

      const standardDelivery = deliveryChargeSetting ? parseFloat(deliveryChargeSetting.value) : 99;
      const freeThreshold = freeThresholdSetting ? parseFloat(freeThresholdSetting.value) : 1499;

      let deliveryCharge = subtotal >= freeThreshold ? 0 : standardDelivery;

      // Validate Coupon if applied
      let discountAmount = 0;
      let appliedCoupon: any = null;

      if (coupon_code && typeof coupon_code === 'string' && coupon_code.trim() !== '') {
        const cleanCode = coupon_code.trim().toUpperCase();
        const coupon = db.queryOne<any>('SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1', [cleanCode]);
        if (coupon) {
          const today = new Date().toISOString().split('T')[0];
          const isValidDate = (!coupon.start_date || coupon.start_date <= today) && (!coupon.end_date || coupon.end_date >= today);
          const meetsMin = !coupon.min_order_value || subtotal >= coupon.min_order_value;
          const meetsUsage = coupon.usage_limit === 0 || coupon.usage_count < coupon.usage_limit;

          if (isValidDate && meetsMin && meetsUsage) {
            if (coupon.discount_type === 'percent') {
              discountAmount = (subtotal * coupon.discount_value) / 100;
              if (coupon.max_discount > 0 && discountAmount > coupon.max_discount) {
                discountAmount = coupon.max_discount;
              }
            } else {
              discountAmount = Math.min(coupon.discount_value, subtotal);
            }
            discountAmount = Math.round(discountAmount * 100) / 100;
            appliedCoupon = coupon;

            // Increment coupon usage count
            db.run('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = ?', [coupon.id]);
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const orderNumber = generateOrderNumber();
      const now = new Date().toISOString();

      const shippingAddress = {
        full_name: customer_name.trim(),
        phone: cleanPhone,
        house_street: house_street.trim(),
        area_locality: area_locality.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: cleanPincode,
        landmark: (landmark || '').trim(),
        delivery_instructions: (delivery_instructions || '').trim()
      };

      const customerId = req.user?.id || null;

      // Insert Order
      db.run(
        `INSERT INTO orders (
          id, order_number, customer_id, customer_name, customer_email, customer_phone,
          shipping_address_json, payment_method, subtotal, discount_amount, delivery_charge,
          total_amount, coupon_code, status, delivery_instructions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'COD', ?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          customerId,
          customer_name.trim(),
          customer_email ? customer_email.trim().toLowerCase() : null,
          cleanPhone,
          JSON.stringify(shippingAddress),
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount,
          appliedCoupon ? appliedCoupon.code : null,
          (delivery_instructions || '').trim(),
          now,
          now
        ]
      );

      // Insert Order Items
      for (const item of orderItemsToInsert) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        db.run(
          `INSERT INTO order_items (id, order_id, product_id, product_title, sku, price, quantity, subtotal, selected_variant, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.product_id,
            item.title,
            item.sku,
            item.unit_price,
            item.quantity,
            item.subtotal,
            item.variant,
            now
          ]
        );
      }

      // Initial Order Status History
      const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.run(
        `INSERT INTO order_status_history (id, order_id, status, comment, changed_by, created_at)
         VALUES (?, ?, 'Pending', 'Order placed successfully with Cash on Delivery (COD).', 'Customer', ?)`,
        [histId, orderId, now]
      );

      // Record coupon redemption if applicable
      if (appliedCoupon) {
        const redempId = `redemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        db.run(
          `INSERT INTO coupon_redemptions (id, coupon_id, order_id, customer_phone, discount_applied, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [redempId, appliedCoupon.id, orderId, cleanPhone, discountAmount, now]
        );
      }

      return {
        id: orderId,
        order_number: orderNumber,
        customer_name: customer_name.trim(),
        customer_phone: cleanPhone,
        subtotal,
        discount_amount: discountAmount,
        delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        payment_method: 'COD',
        status: 'Pending',
        shipping_address: shippingAddress,
        items: orderItemsToInsert,
        created_at: now
      };
    });

    res.status(201).json({
      success: true,
      message: 'Your order has been placed successfully with Cash on Delivery!',
      order: createdOrder
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to place order.' });
  }
});

// Secure Order Tracking by Order Number + Phone/Email
router.post('/orders/track', (req, res) => {
  try {
    const { order_number, verification } = req.body;
    if (!order_number || !verification) {
      return res.status(400).json({ error: 'Please provide both Order Number and Phone or Email.' });
    }

    const cleanOrderNumber = order_number.trim().toUpperCase();
    const cleanVerification = verification.trim().toLowerCase().replace(/[\s-]/g, '');

    const order = db.queryOne<any>(
      `SELECT * FROM orders
       WHERE UPPER(order_number) = ?
         AND (REPLACE(REPLACE(customer_phone, ' ', ''), '-', '') LIKE ? OR LOWER(customer_email) = ?)`,
      [cleanOrderNumber, `%${cleanVerification}%`, cleanVerification]
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found. Please verify the Order Number and the mobile number or email used during checkout.'
      });
    }

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = db.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

    res.json({
      order: {
        ...order,
        shipping_address: JSON.parse(order.shipping_address_json || '{}')
      },
      items,
      history
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Auth: Optional Registration & Login
router.post('/auth/customer/register', (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.queryOne('SELECT id FROM profiles WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO profiles (id, email, full_name, phone, role, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'customer', ?, ?, ?)`,
      [id, cleanEmail, full_name.trim(), (phone || '').trim(), hash, now, now]
    );

    const token = jwt.sign(
      { id, email: cleanEmail, role: 'customer', full_name: full_name.trim() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id, email: cleanEmail, full_name: full_name.trim(), phone: (phone || '').trim(), role: 'customer' }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/customer/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.queryOne<any>('SELECT * FROM profiles WHERE LOWER(email) = ?', [cleanEmail]);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Orders & Profile
router.get('/customer/orders', requireCustomer, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const orders = db.query(
      'SELECT * FROM orders WHERE customer_id = ? OR LOWER(customer_email) = ? ORDER BY created_at DESC',
      [req.user!.id, req.user!.email]
    ).map(ord => ({
      ...ord,
      shipping_address: JSON.parse(ord.shipping_address_json || '{}'),
      items: db.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id])
    }));

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/customer/profile', requireCustomer, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const profile = db.queryOne<any>('SELECT id, email, full_name, phone, role, created_at FROM profiles WHERE id = ?', [req.user!.id]);
    if (!profile) return res.status(404).json({ error: 'Customer not found.' });
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/customer/profile', requireCustomer, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { full_name, phone } = req.body;
    const now = new Date().toISOString();
    db.run(
      'UPDATE profiles SET full_name = ?, phone = ?, updated_at = ? WHERE id = ?',
      [full_name.trim(), (phone || '').trim(), now, req.user!.id]
    );
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ADMIN & OWNER DASHBOARD ENDPOINTS
// ==========================================

// Rate-limiting tracker for admin login attempts
const adminLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();

router.post('/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || 'unknown';

    // Simple brute-force protection
    const attempt = adminLoginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
    if (attempt.count >= 6 && Date.now() - attempt.lastAttempt < 15 * 60 * 1000) {
      return res.status(429).json({ error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both admin email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = db.queryOne<any>('SELECT * FROM profiles WHERE LOWER(email) = ? AND role = "admin"', [cleanEmail]);

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      attempt.count += 1;
      attempt.lastAttempt = Date.now();
      adminLoginAttempts.set(ip, attempt);
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    // Reset failed attempts on success
    adminLoginAttempts.delete(ip);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin', full_name: admin.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logAdminActivity(admin.id, 'LOGIN', 'auth', admin.id, 'Admin logged in successfully', req);

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/me', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const admin = db.queryOne<any>('SELECT id, email, full_name, role, created_at FROM profiles WHERE id = ?', [req.user!.id]);
    res.json(admin);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/change-password', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const admin = db.queryOne<any>('SELECT * FROM profiles WHERE id = ?', [req.user!.id]);
    if (!admin || !bcrypt.compareSync(current_password, admin.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = bcrypt.hashSync(new_password, 10);
    const now = new Date().toISOString();
    db.run('UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?', [newHash, now, req.user!.id]);

    logAdminActivity(req.user!.id, 'UPDATE_PASSWORD', 'profile', req.user!.id, 'Owner password updated', req);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Dashboard Analytics
router.get('/admin/analytics', requireAdmin, (_req, res) => {
  try {
    const orders = db.query<any>('SELECT * FROM orders');
    const totalOrders = orders.length;

    let pendingCount = 0;
    let confirmedCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let totalGrossRevenue = 0;
    let deliveredCodCollected = 0;
    let pendingCodAmount = 0;

    orders.forEach(o => {
      const amt = Number(o.total_amount) || 0;
      totalGrossRevenue += amt;

      switch (o.status) {
        case 'Pending':
          pendingCount++;
          pendingCodAmount += amt;
          break;
        case 'Confirmed':
        case 'Processing':
          confirmedCount++;
          pendingCodAmount += amt;
          break;
        case 'Shipped':
          shippedCount++;
          pendingCodAmount += amt;
          break;
        case 'Delivered':
          deliveredCount++;
          deliveredCodCollected += amt;
          break;
        case 'Cancelled':
          cancelledCount++;
          break;
      }
    });

    const products = db.query<any>('SELECT id, stock, is_active FROM products');
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.is_active === 1 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.is_active === 1 && p.stock === 0).length;

    const recentOrders = db.query<any>(
      'SELECT id, order_number, customer_name, customer_phone, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 6'
    );

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingCount,
        confirmed_or_processing: confirmedCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount
      },
      revenue: {
        total_gross_value: Math.round(totalGrossRevenue),
        delivered_cod_collected: Math.round(deliveredCodCollected),
        pending_cod_collection: Math.round(pendingCodAmount)
      },
      inventory: {
        total_products: totalProducts,
        low_stock: lowStockCount,
        out_of_stock: outOfStockCount
      },
      recent_orders: recentOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Product Upload (Multi-image)
router.post('/admin/upload', requireAdmin, upload.single('image'), (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Products CRUD
router.get('/admin/products', requireAdmin, (_req, res) => {
  try {
    const products = db.query<any>(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    ).map(p => {
      const images = db.query<{ id: string; image_url: string; is_primary: number }>(
        'SELECT id, image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC',
        [p.id]
      );
      return {
        ...p,
        images: images.map(i => i.image_url),
        image_records: images,
        primary_image: images.length > 0 ? images[0].image_url : null,
        variants: p.variants_json ? JSON.parse(p.variants_json) : null
      };
    });

    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/products', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const {
      title,
      slug,
      sku,
      description,
      category_id,
      price,
      sale_price,
      stock,
      is_featured,
      is_active,
      variants,
      images
    } = req.body;

    if (!title || !category_id || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Title, Category, Price, and Stock are required.' });
    }

    const cleanTitle = title.trim();
    const cleanSku = (sku || `SKB-${Date.now().toString(36).toUpperCase()}`).trim();
    const cleanSlug = (slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    // Check SKU uniqueness
    const existingSku = db.queryOne('SELECT id FROM products WHERE sku = ?', [cleanSku]);
    if (existingSku) {
      return res.status(400).json({ error: `SKU "${cleanSku}" already exists. Please choose a unique SKU.` });
    }

    const prodId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const variantsJson = variants ? JSON.stringify(variants) : null;

    db.transaction(() => {
      db.run(
        `INSERT INTO products (
          id, title, slug, sku, description, category_id, price, sale_price,
          stock, is_featured, is_active, variants_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prodId,
          cleanTitle,
          cleanSlug,
          cleanSku,
          description ? description.trim() : '',
          category_id,
          Number(price),
          sale_price ? Number(sale_price) : null,
          Math.max(0, parseInt(stock, 10)),
          is_featured ? 1 : 0,
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          variantsJson,
          now,
          now
        ]
      );

      // Save product images
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((imgUrl: string, idx: number) => {
          if (imgUrl && typeof imgUrl === 'string') {
            const imgId = `img_${Date.now()}_${idx}`;
            db.run(
              `INSERT INTO product_images (id, product_id, image_url, display_order, is_primary, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [imgId, prodId, imgUrl.trim(), idx, idx === 0 ? 1 : 0, now]
            );
          }
        });
      }
    });

    logAdminActivity(req.user!.id, 'CREATE_PRODUCT', 'product', prodId, `Created product: ${cleanTitle}`, req);

    res.status(201).json({ success: true, id: prodId, message: 'Product created successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/products/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      sku,
      description,
      category_id,
      price,
      sale_price,
      stock,
      is_featured,
      is_active,
      variants,
      images
    } = req.body;

    const existing = db.queryOne<any>('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const cleanTitle = (title || existing.title).trim();
    const cleanSku = (sku || existing.sku).trim();
    const cleanSlug = (slug || existing.slug).trim();

    // Check SKU duplicate on other products
    const otherWithSku = db.queryOne('SELECT id FROM products WHERE sku = ? AND id != ?', [cleanSku, id]);
    if (otherWithSku) {
      return res.status(400).json({ error: `SKU "${cleanSku}" is already used by another product.` });
    }

    const now = new Date().toISOString();
    const variantsJson = variants ? JSON.stringify(variants) : existing.variants_json;

    db.transaction(() => {
      db.run(
        `UPDATE products SET
          title = ?, slug = ?, sku = ?, description = ?, category_id = ?, price = ?, sale_price = ?,
          stock = ?, is_featured = ?, is_active = ?, variants_json = ?, updated_at = ?
         WHERE id = ?`,
        [
          cleanTitle,
          cleanSlug,
          cleanSku,
          description !== undefined ? description.trim() : existing.description,
          category_id || existing.category_id,
          Number(price !== undefined ? price : existing.price),
          sale_price !== undefined ? (sale_price ? Number(sale_price) : null) : existing.sale_price,
          stock !== undefined ? Math.max(0, parseInt(stock, 10)) : existing.stock,
          is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
          is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
          variantsJson,
          now,
          id
        ]
      );

      // If new images array provided, replace
      if (Array.isArray(images)) {
        db.run('DELETE FROM product_images WHERE product_id = ?', [id]);
        images.forEach((imgUrl: string, idx: number) => {
          if (imgUrl && typeof imgUrl === 'string') {
            const imgId = `img_${Date.now()}_${idx}`;
            db.run(
              `INSERT INTO product_images (id, product_id, image_url, display_order, is_primary, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [imgId, id, imgUrl.trim(), idx, idx === 0 ? 1 : 0, now]
            );
          }
        });
      }
    });

    logAdminActivity(req.user!.id, 'UPDATE_PRODUCT', 'product', id, `Updated product: ${cleanTitle}`, req);

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/products/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.queryOne<any>('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Check if product was ordered
    const orderCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM order_items WHERE product_id = ?', [id]);
    if (orderCount && orderCount.count > 0) {
      // Rather than deleting, deactivate to preserve order integrity
      db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      logAdminActivity(req.user!.id, 'DEACTIVATE_PRODUCT', 'product', id, `Deactivated product with orders: ${existing.title}`, req);
      return res.json({
        success: true,
        message: 'Product has historical orders, so it was safely deactivated and hidden from the storefront instead of deleted.'
      });
    }

    db.transaction(() => {
      db.run('DELETE FROM product_images WHERE product_id = ?', [id]);
      db.run('DELETE FROM products WHERE id = ?', [id]);
    });

    logAdminActivity(req.user!.id, 'DELETE_PRODUCT', 'product', id, `Deleted product: ${existing.title}`, req);

    res.json({ success: true, message: 'Product deleted permanently.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Categories CRUD
router.get('/admin/categories', requireAdmin, (_req, res) => {
  try {
    const categories = db.query<any>(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as total_products
       FROM categories c
       ORDER BY c.display_order ASC, c.name ASC`
    );
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/categories', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { name, slug, description, image_url, display_order, is_active } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    const existing = db.queryOne('SELECT id FROM categories WHERE slug = ? OR LOWER(name) = ?', [cleanSlug, cleanName.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'A category with this name or slug already exists.' });
    }

    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        cleanName,
        cleanSlug,
        description ? description.trim() : '',
        image_url ? image_url.trim() : '',
        display_order ? parseInt(display_order, 10) : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        now
      ]
    );

    logAdminActivity(req.user!.id, 'CREATE_CATEGORY', 'category', id, `Created category: ${cleanName}`, req);

    res.status(201).json({ success: true, id, message: 'Category created successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/categories/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, display_order, is_active } = req.body;

    const existing = db.queryOne<any>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    const cleanName = (name || existing.name).trim();
    const cleanSlug = (slug || existing.slug).trim();

    db.run(
      `UPDATE categories SET
        name = ?, slug = ?, description = ?, image_url = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [
        cleanName,
        cleanSlug,
        description !== undefined ? description.trim() : existing.description,
        image_url !== undefined ? image_url.trim() : existing.image_url,
        display_order !== undefined ? parseInt(display_order, 10) : existing.display_order,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      ]
    );

    logAdminActivity(req.user!.id, 'UPDATE_CATEGORY', 'category', id, `Updated category: ${cleanName}`, req);

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/categories/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const prodCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (prodCount && prodCount.count > 0) {
      return res.status(400).json({
        error: `Cannot delete category. It currently contains ${prodCount.count} product(s). Move or delete the products first.`
      });
    }

    db.run('DELETE FROM categories WHERE id = ?', [id]);
    logAdminActivity(req.user!.id, 'DELETE_CATEGORY', 'category', id, 'Deleted category', req);

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Order Management
router.get('/admin/orders', requireAdmin, (req, res) => {
  try {
    const { search, status, limit = '100' } = req.query;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(order_number) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(customer_phone) LIKE ?)';
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit as string, 10) || 100);

    const orders = db.query<any>(query, params).map(ord => ({
      ...ord,
      shipping_address: JSON.parse(ord.shipping_address_json || '{}')
    }));

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.queryOne<any>('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const history = db.query('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC', [order.id]);

    res.json({
      order: {
        ...order,
        shipping_address: JSON.parse(order.shipping_address_json || '{}')
      },
      items,
      history
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/admin/orders/:id/status', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment, cancellation_reason } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = db.queryOne<any>('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (order.status === status) {
      return res.status(400).json({ error: `Order is already in "${status}" status.` });
    }

    const now = new Date().toISOString();

    db.transaction(() => {
      // If cancelling, restore inventory safely!
      if (status === 'Cancelled' && order.status !== 'Cancelled') {
        const items = db.query<{ product_id: string; quantity: number }>('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
        for (const itm of items) {
          db.run('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?', [itm.quantity, now, itm.product_id]);
        }
      }

      // Update order status
      db.run(
        `UPDATE orders SET
          status = ?,
          cancellation_reason = ?,
          updated_at = ?
         WHERE id = ?`,
        [
          status,
          status === 'Cancelled' ? (cancellation_reason || comment || 'Cancelled by Store Admin') : order.cancellation_reason,
          now,
          id
        ]
      );

      // Record in order status history
      const histId = `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.run(
        `INSERT INTO order_status_history (id, order_id, status, comment, changed_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [histId, id, status, comment || `Status updated to ${status}`, req.user!.full_name, now]
      );
    });

    logAdminActivity(req.user!.id, 'UPDATE_ORDER_STATUS', 'order', id, `Updated order ${order.order_number} to ${status}`, req);

    res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Customer Management
router.get('/admin/customers', requireAdmin, (_req, res) => {
  try {
    const customers = db.query<any>(
      `SELECT p.id, p.email, p.full_name, p.phone, p.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.customer_id = p.id OR LOWER(o.customer_email) = LOWER(p.email)) as order_count,
              (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE (o.customer_id = p.id OR LOWER(o.customer_email) = LOWER(p.email)) AND o.status != 'Cancelled') as total_spend
       FROM profiles p
       WHERE p.role = 'customer'
       ORDER BY p.created_at DESC`
    );

    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Coupons CRUD
router.get('/admin/coupons', requireAdmin, (_req, res) => {
  try {
    const coupons = db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/coupons', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { code, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date, is_active } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: 'Code, Discount Type, and Discount Value are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.queryOne('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (existing) {
      return res.status(400).json({ error: `Coupon code "${cleanCode}" already exists.` });
    }

    const id = `cpn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, usage_limit, usage_count, start_date, end_date, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [
        id,
        cleanCode,
        discount_type,
        Number(discount_value),
        Number(min_order_value || 0),
        Number(max_discount || 0),
        parseInt(usage_limit || '0', 10),
        start_date || null,
        end_date || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        now
      ]
    );

    logAdminActivity(req.user!.id, 'CREATE_COUPON', 'coupon', id, `Created coupon: ${cleanCode}`, req);

    res.status(201).json({ success: true, id, message: 'Coupon created successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/coupons/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_order_value, max_discount, usage_limit, start_date, end_date, is_active } = req.body;

    const existing = db.queryOne<any>('SELECT * FROM coupons WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Coupon not found.' });

    const cleanCode = (code || existing.code).trim().toUpperCase();

    db.run(
      `UPDATE coupons SET
        code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, max_discount = ?,
        usage_limit = ?, start_date = ?, end_date = ?, is_active = ?
       WHERE id = ?`,
      [
        cleanCode,
        discount_type || existing.discount_type,
        discount_value !== undefined ? Number(discount_value) : existing.discount_value,
        min_order_value !== undefined ? Number(min_order_value) : existing.min_order_value,
        max_discount !== undefined ? Number(max_discount) : existing.max_discount,
        usage_limit !== undefined ? parseInt(usage_limit, 10) : existing.usage_limit,
        start_date !== undefined ? start_date : existing.start_date,
        end_date !== undefined ? end_date : existing.end_date,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        id
      ]
    );

    logAdminActivity(req.user!.id, 'UPDATE_COUPON', 'coupon', id, `Updated coupon: ${cleanCode}`, req);

    res.json({ success: true, message: 'Coupon updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/coupons/:id', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM coupons WHERE id = ?', [id]);
    logAdminActivity(req.user!.id, 'DELETE_COUPON', 'coupon', id, 'Deleted coupon', req);
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Store Settings
router.get('/admin/settings', requireAdmin, (_req, res) => {
  try {
    const rows = db.query<{ key: string; value: string }>('SELECT key, value FROM store_settings');
    const settings: Record<string, string> = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/admin/settings', requireAdmin, (req: Request & { user?: AuthUser }, res: Response) => {
  try {
    const settings = req.body;
    const now = new Date().toISOString();

    db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'string' || typeof value === 'number') {
          const valStr = String(value);
          const existing = db.queryOne('SELECT key FROM store_settings WHERE key = ?', [key]);
          if (existing) {
            db.run('UPDATE store_settings SET value = ?, updated_at = ? WHERE key = ?', [valStr, now, key]);
          } else {
            db.run('INSERT INTO store_settings (key, value, updated_at) VALUES (?, ?, ?)', [key, valStr, now]);
          }
        }
      }
    });

    logAdminActivity(req.user!.id, 'UPDATE_SETTINGS', 'settings', 'store_settings', 'Store settings updated', req);

    res.json({ success: true, message: 'Store settings saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Activity Logs
router.get('/admin/activity-logs', requireAdmin, (_req, res) => {
  try {
    const logs = db.query<any>(
      `SELECT l.*, p.full_name as admin_name, p.email as admin_email
       FROM admin_activity_logs l
       LEFT JOIN profiles p ON l.admin_id = p.id
       ORDER BY l.created_at DESC
       LIMIT 100`
    );
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
