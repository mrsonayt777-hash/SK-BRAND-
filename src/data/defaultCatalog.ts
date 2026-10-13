import { Product, Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_ethnic_men',
    name: "Men's Ethnic Wear",
    slug: 'mens-ethnic',
    description: 'Handcrafted kurtas, Nehru jackets, and festive ensembles in royal fabrics.',
    image_url: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
    display_order: 1,
    is_active: 1,
    product_count: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat_shirts_men',
    name: 'Shirts & Casuals',
    slug: 'shirts-casuals',
    description: 'Breathable pure cotton, linen blends, and formal shirts tailored for comfort.',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    display_order: 2,
    is_active: 1,
    product_count: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat_jackets_men',
    name: 'Jackets & Blazers',
    slug: 'jackets-blazers',
    description: 'Signature waistcoats, structured blazers, and modern overshirts.',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    display_order: 3,
    is_active: 1,
    product_count: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat_footwear',
    name: 'Footwear & Mojaris',
    slug: 'footwear-mojaris',
    description: 'Traditional handcrafted leather juttis, mojaris, and contemporary loafers.',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    display_order: 4,
    is_active: 1,
    product_count: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat_ethnic_women',
    name: "Women's Festive & Sarees",
    slug: 'womens-festive',
    description: 'Heritage handloom sarees, anarkalis, and artisanal festive dupattas.',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    display_order: 5,
    is_active: 1,
    product_count: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat_accessories',
    name: 'Accessories & Stoles',
    slug: 'accessories-stoles',
    description: 'Silk pocket squares, embroidered shawls, and premium genuine leather belts.',
    image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    display_order: 6,
    is_active: 1,
    product_count: 1,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    title: 'SK Royal Indigo Embroidered Kurta',
    slug: 'sk-royal-indigo-embroidered-kurta',
    sku: 'SKB-KUR-001',
    description: 'Crafted from pure slub cotton with exquisite tone-on-tone thread embroidery across the mandarin collar and placket. Designed for Indian festive gatherings and wedding soirees with supreme all-day comfort.',
    category_id: 'cat_ethnic_men',
    category_name: "Men's Ethnic Wear",
    price: 2499,
    sale_price: 1899,
    stock: 35,
    is_featured: 1,
    is_active: 1,
    variants: {
      sizes: ['M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
      colors: ['Royal Indigo', 'Heritage White']
    },
    images: [
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_02',
    title: 'SK Heritage Raw Silk Nehru Jacket',
    slug: 'sk-heritage-raw-silk-nehru-jacket',
    sku: 'SKB-JKT-002',
    description: 'A stately sleeveless Nehru waistcoat tailored from rich textured raw silk blend. Features hand-finished brass buttons, chest welt pocket, and inner satin lining. Layer over any kurta or crisp dress shirt.',
    category_id: 'cat_jackets_men',
    category_name: 'Jackets & Blazers',
    price: 3999,
    sale_price: 2799,
    stock: 22,
    is_featured: 1,
    is_active: 1,
    variants: {
      sizes: ['38', '40', '42', '44'],
      colors: ['Deep Midnight Navy', 'Imperial Maroon', 'Charcoal Slate']
    },
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_03',
    title: 'SK Artisanal Linen-Cotton Mandarin Shirt',
    slug: 'sk-artisanal-linen-cotton-mandarin-shirt',
    sku: 'SKB-SHT-003',
    description: 'Woven with certified long-staple cotton and natural linen for natural breathability in tropical Indian weather. Features curved hemline, clean button cuffs, and subtle mother-of-pearl buttons.',
    category_id: 'cat_shirts_men',
    category_name: 'Shirts & Casuals',
    price: 1999,
    sale_price: 1499,
    stock: 50,
    is_featured: 1,
    is_active: 1,
    variants: {
      sizes: ['S (38)', 'M (40)', 'L (42)', 'XL (44)'],
      colors: ['Ivory Sand', 'Sage Olive', 'Sky Blue']
    },
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_04',
    title: 'SK Hand-Burnished Leather Mojaris',
    slug: 'sk-hand-burnished-leather-mojaris',
    sku: 'SKB-FTW-004',
    description: 'Authentic handcrafted traditional Punjabi jutti silhouette made from supple genuine leather. Features memory foam cushioning footbed and sturdy double-stitched leather sole for blister-free celebrations.',
    category_id: 'cat_footwear',
    category_name: 'Footwear & Mojaris',
    price: 2799,
    sale_price: 2199,
    stock: 18,
    is_featured: 1,
    is_active: 1,
    variants: {
      sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      colors: ['Tan Antique', 'Classic Jet Black']
    },
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_05',
    title: 'SK Chanderi Silk Zari Embroidered Saree',
    slug: 'sk-chanderi-silk-zari-embroidered-saree',
    sku: 'SKB-SAR-005',
    description: 'Feather-light Chanderi silk saree showcasing authentic hand-woven golden zari buttis and an opulent pallu with intricate peacock motifs. Comes with unstitched matching blouse fabric (0.8m).',
    category_id: 'cat_ethnic_women',
    category_name: "Women's Festive & Sarees",
    price: 4999,
    sale_price: 3699,
    stock: 15,
    is_featured: 1,
    is_active: 1,
    variants: {
      sizes: ['Free Size (5.5m + 0.8m)'],
      colors: ['Emerald Peacock Green', 'Crimson Ruby', 'Rani Pink']
    },
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_06',
    title: 'SK Pashmina Feel Jacquard Stole',
    slug: 'sk-pashmina-feel-jacquard-stole',
    sku: 'SKB-ACC-006',
    description: 'Ultra-soft winter jacquard stole with traditional Kashmiri paisley weave and delicate eyelash fringes. Ideal complement to sherwanis, kurtas, or everyday casual evening wear.',
    category_id: 'cat_accessories',
    category_name: 'Accessories & Stoles',
    price: 1499,
    sale_price: 999,
    stock: 40,
    is_featured: 0,
    is_active: 1,
    variants: {
      sizes: ['Standard (70cm x 200cm)'],
      colors: ['Ivory Gold', 'Rich Maroon', 'Sapphire Blue']
    },
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80'
    ],
    primary_image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=900&q=80',
    created_at: new Date().toISOString()
  }
];
