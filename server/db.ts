import fs from 'fs';
import path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import bcrypt from 'bcryptjs';

const DB_DIR = path.resolve('data');
const DB_PATH = path.join(DB_DIR, 'skbrand.sqlite');

let dbInstance: SqlJsDatabase | null = null;
let inTransaction = false;

// Helper to save database to disk
export function persistDb() {
  if (!dbInstance || inTransaction) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = dbInstance.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

// Database helper methods
export const db = {
  run(sql: string, params: any[] = []): void {
    if (!dbInstance) throw new Error('Database not initialized');
    dbInstance.run(sql, params);
    persistDb();
  },

  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!dbInstance) throw new Error('Database not initialized');
    const stmt = dbInstance.prepare(sql);
    try {
      stmt.bind(params);
      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      return results;
    } finally {
      stmt.free();
    }
  },

  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const rows = this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  },

  transaction<T>(fn: () => T): T {
    if (!dbInstance) throw new Error('Database not initialized');
    inTransaction = true;
    dbInstance.run('BEGIN TRANSACTION;');
    try {
      const result = fn();
      dbInstance.run('COMMIT;');
      inTransaction = false;
      persistDb();
      return result;
    } catch (err) {
      try {
        dbInstance.run('ROLLBACK;');
      } catch (rollbackErr) {
        console.warn('Rollback failed:', rollbackErr);
      }
      inTransaction = false;
      console.error('Transaction error:', err);
      throw err;
    }
  }
};

// Initialize SQLite Schema & Default Seed Data
export async function initDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Existing DB corrupted or unreadable, creating new DB', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create tables
  dbInstance.run(`
    -- Profiles table (Customers and Admins)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      price REAL NOT NULL,
      sale_price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      variants_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Product Images table
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Customer addresses
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      house_street TEXT NOT NULL,
      area_locality TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      landmark TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Coupons table
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'percent' or 'fixed'
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount REAL DEFAULT 0,
      usage_limit INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      shipping_address_json TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'COD',
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      delivery_charge REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      coupon_code TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      cancellation_reason TEXT,
      delivery_instructions TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Order items with historical product snapshot
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      sku TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      selected_variant TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Order status history
    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      comment TEXT,
      changed_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Coupon redemptions
    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id TEXT PRIMARY KEY,
      coupon_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      discount_applied REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Store settings
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Admin activity logs
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);

  // Run seed check
  seedDatabaseIfEmpty();

  persistDb();
  console.log('Database initialized and connected.');
  return dbInstance;
}

function seedDatabaseIfEmpty() {
  const adminCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM profiles WHERE role = "admin"');
  const now = new Date().toISOString();

  // 1. Seed Owner Admin Account
  if (!adminCount || adminCount.count === 0) {
    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@skbrand.in').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@SKBrand2026';
    const hash = bcrypt.hashSync(adminPassword, 10);

    db.run(
      `INSERT INTO profiles (id, email, full_name, phone, role, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['admin_owner_01', adminEmail, 'SK Brand Owner', '+91 98765 00000', 'admin', hash, now, now]
    );
    console.log(`Initial Admin created: ${adminEmail}`);
  }

  // 2. Seed Store Settings
  const settingsCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM store_settings');
  if (!settingsCount || settingsCount.count === 0) {
    const defaultSettings: Record<string, string> = {
      store_name: 'SK BRAND',
      store_tagline: 'Timeless Indian Craftsmanship & Modern Style',
      contact_email: 'support@skbrand.in',
      contact_phone: '+91 98765 43210',
      business_address: 'SK Brand Studio, 42 Heritage Plaza, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038',
      delivery_charge: '99',
      free_shipping_threshold: '1499',
      cod_enabled: 'true',
      online_payment_notice: 'Online Payment — Coming Soon',
      announcement_bar: 'Grand Season Sale: Cash on Delivery available across all pin codes! Free shipping over ₹1,499.',
      return_window_days: '7',
      cancellation_window_hours: '24'
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      db.run('INSERT INTO store_settings (key, value, updated_at) VALUES (?, ?, ?)', [key, value, now]);
    }
  }

  // 3. Seed Categories
  const categoryCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories');
  if (!categoryCount || categoryCount.count === 0) {
    const categories = [
      {
        id: 'cat_ethnic_men',
        name: "Men's Ethnic Wear",
        slug: 'mens-ethnic',
        description: 'Handcrafted kurtas, Nehru jackets, and festive ensembles in royal fabrics.',
        image_url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
        display_order: 1
      },
      {
        id: 'cat_shirts_men',
        name: 'Shirts & Casuals',
        slug: 'shirts-casuals',
        description: 'Breathable pure cotton, linen blends, and formal shirts tailored for comfort.',
        image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        display_order: 2
      },
      {
        id: 'cat_jackets_men',
        name: 'Jackets & Blazers',
        slug: 'jackets-blazers',
        description: 'Signature waistcoats, structured blazers, and modern overshirts.',
        image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        display_order: 3
      },
      {
        id: 'cat_footwear',
        name: 'Footwear & Mojaris',
        slug: 'footwear-mojaris',
        description: 'Traditional handcrafted leather juttis, mojaris, and contemporary loafers.',
        image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        display_order: 4
      },
      {
        id: 'cat_ethnic_women',
        name: "Women's Festive & Sarees",
        slug: 'womens-festive',
        description: 'Heritage handloom sarees, anarkalis, and artisanal festive dupattas.',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        display_order: 5
      },
      {
        id: 'cat_accessories',
        name: 'Accessories & Stoles',
        slug: 'accessories-stoles',
        description: 'Silk pocket squares, embroidered shawls, and premium genuine leather belts.',
        image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
        display_order: 6
      }
    ];

    for (const cat of categories) {
      db.run(
        `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
        [cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.display_order, now]
      );
    }
  }

  // 4. Seed Products & Images
  const productCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM products');
  if (!productCount || productCount.count === 0) {
    const products = [
      {
        id: 'prod_01',
        title: 'SK Royal Indigo Embroidered Kurta',
        slug: 'sk-royal-indigo-embroidered-kurta',
        sku: 'SKB-KUR-001',
        description: 'Crafted from pure slub cotton with exquisite tone-on-tone thread embroidery across the mandarin collar and placket. Designed for Indian festive gatherings and wedding soirees with supreme all-day comfort.',
        category_id: 'cat_ethnic_men',
        price: 2499,
        sale_price: 1899,
        stock: 35,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
          colors: ['Royal Indigo', 'Heritage White']
        }),
        images: [
          'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_02',
        title: 'SK Heritage Raw Silk Nehru Jacket',
        slug: 'sk-heritage-raw-silk-nehru-jacket',
        sku: 'SKB-JKT-002',
        description: 'A stately sleeveless Nehru waistcoat tailored from rich textured raw silk blend. Features hand-finished brass buttons, chest welt pocket, and inner satin lining. Layer over any kurta or crisp dress shirt.',
        category_id: 'cat_jackets_men',
        price: 3999,
        sale_price: 2799,
        stock: 22,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['38', '40', '42', '44'],
          colors: ['Deep Midnight Navy', 'Imperial Maroon', 'Charcoal Slate']
        }),
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_03',
        title: 'SK Artisanal Linen-Cotton Mandarin Shirt',
        slug: 'sk-artisanal-linen-cotton-mandarin-shirt',
        sku: 'SKB-SHT-003',
        description: 'Woven with certified long-staple cotton and natural linen for natural breathability in tropical Indian weather. Features curved hemline, clean button cuffs, and subtle mother-of-pearl buttons.',
        category_id: 'cat_shirts_men',
        price: 1999,
        sale_price: 1499,
        stock: 50,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['S (38)', 'M (40)', 'L (42)', 'XL (44)'],
          colors: ['Ivory Sand', 'Sage Olive', 'Sky Blue']
        }),
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_04',
        title: 'SK Hand-Burnished Leather Mojaris',
        slug: 'sk-hand-burnished-leather-mojaris',
        sku: 'SKB-FTW-004',
        description: 'Authentic handcrafted traditional Punjabi jutti silhouette made from supple genuine leather. Features memory foam cushioning footbed and sturdy double-stitched leather sole for blister-free celebrations.',
        category_id: 'cat_footwear',
        price: 2799,
        sale_price: 2199,
        stock: 18,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
          colors: ['Tan Antique', 'Classic Jet Black']
        }),
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_05',
        title: 'SK Chanderi Silk Zari Embroidered Saree',
        slug: 'sk-chanderi-silk-zari-embroidered-saree',
        sku: 'SKB-SAR-005',
        description: 'Feather-light Chanderi silk saree showcasing authentic hand-woven golden zari buttis and an opulent pallu with intricate peacock motifs. Comes with unstitched matching blouse fabric (0.8m).',
        category_id: 'cat_ethnic_women',
        price: 4999,
        sale_price: 3699,
        stock: 15,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['Free Size (5.5m + 0.8m)'],
          colors: ['Emerald Peacock Green', 'Crimson Ruby', 'Rani Pink']
        }),
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_06',
        title: 'SK Pashmina Feel Jacquard Stole',
        slug: 'sk-pashmina-feel-jacquard-stole',
        sku: 'SKB-ACC-006',
        description: 'Ultra-soft winter jacquard stole with traditional Kashmiri paisley weave and delicate eyelash fringes. Ideal complement to sherwanis, kurtas, or everyday casual evening wear.',
        category_id: 'cat_accessories',
        price: 1499,
        sale_price: 999,
        stock: 40,
        is_featured: 0,
        variants_json: JSON.stringify({
          sizes: ['Standard (70cm x 200cm)'],
          colors: ['Ivory Gold', 'Rich Maroon', 'Sapphire Blue']
        }),
        images: [
          'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_07',
        title: 'SK Classic Oxford Cotton Formal Shirt',
        slug: 'sk-classic-oxford-cotton-formal-shirt',
        sku: 'SKB-SHT-007',
        description: 'Pre-washed 100% heavy Oxford pinpoint weave with a classic spread collar and structured french placket. Machine washable with low wrinkle technology for executive daily wear.',
        category_id: 'cat_shirts_men',
        price: 1899,
        sale_price: 1399,
        stock: 28,
        is_featured: 0,
        variants_json: JSON.stringify({
          sizes: ['38', '40', '42', '44'],
          colors: ['Crisp White', 'Soft Sky', 'Light Pink']
        }),
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
        ]
      },
      {
        id: 'prod_08',
        title: 'SK Festivity Chikankari Pure Georgette Kurta',
        slug: 'sk-festivity-chikankari-pure-georgette-kurta',
        sku: 'SKB-KUR-008',
        description: 'Inspired by Lucknowi artisan heritage, featuring intricate Bakhiya and Phanda needlework over breathable georgette with a soft cotton inner lining. Regal, graceful, and remarkably lightweight.',
        category_id: 'cat_ethnic_men',
        price: 2999,
        sale_price: 2299,
        stock: 19,
        is_featured: 1,
        variants_json: JSON.stringify({
          sizes: ['M (38)', 'L (40)', 'XL (42)'],
          colors: ['Pastel Mint', 'Powder Peach', 'Pearl White']
        }),
        images: [
          'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80'
        ]
      }
    ];

    for (const p of products) {
      db.run(
        `INSERT INTO products (id, title, slug, sku, description, category_id, price, sale_price, stock, is_featured, is_active, variants_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [p.id, p.title, p.slug, p.sku, p.description, p.category_id, p.price, p.sale_price, p.stock, p.is_featured, p.variants_json, now, now]
      );

      p.images.forEach((url, idx) => {
        db.run(
          `INSERT INTO product_images (id, product_id, image_url, display_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`img_${p.id}_${idx}`, p.id, url, idx, idx === 0 ? 1 : 0, now]
        );
      });
    }
  }

  // 5. Seed Coupons
  const couponCount = db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM coupons');
  if (!couponCount || couponCount.count === 0) {
    const coupons = [
      {
        id: 'cpn_welcome10',
        code: 'WELCOME10',
        discount_type: 'percent',
        discount_value: 10,
        min_order_value: 999,
        max_discount: 300,
        usage_limit: 1000,
        start_date: '2026-01-01',
        end_date: '2027-12-31'
      },
      {
        id: 'cpn_skfestive',
        code: 'FESTIVE200',
        discount_type: 'fixed',
        discount_value: 200,
        min_order_value: 1499,
        max_discount: 200,
        usage_limit: 500,
        start_date: '2026-01-01',
        end_date: '2027-12-31'
      },
      {
        id: 'cpn_royal500',
        code: 'ROYAL500',
        discount_type: 'fixed',
        discount_value: 500,
        min_order_value: 2999,
        max_discount: 500,
        usage_limit: 250,
        start_date: '2026-01-01',
        end_date: '2027-12-31'
      }
    ];

    for (const c of coupons) {
      db.run(
        `INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, usage_limit, usage_count, start_date, end_date, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?)`,
        [c.id, c.code, c.discount_type, c.discount_value, c.min_order_value, c.max_discount, c.usage_limit, c.start_date, c.end_date, now]
      );
    }
  }
}
