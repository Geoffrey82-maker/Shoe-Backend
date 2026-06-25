export const fmt = (v) => `$${Number(v || 0).toFixed(2)}`;

export const discount = (price, salePrice) =>
  salePrice && price ? Math.round((1 - salePrice / price) * 100) : null;

export const firstImage = (images) =>
  images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';

export const statusColor = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  delivered:  '#22c55e',
  cancelled:  '#ef4444',
};

export const BRANDS = [
  'Nike', 'Adidas', 'New Balance', 'Jordan',
  'Puma', 'Reebok', 'Vans', 'Converse',
];

// Categories now use lucide icon names instead of emojis
// The icon rendering is handled by <CategoryIcon id={c.id} />
export const CATEGORIES = [
  { id: 'running',    label: 'Running'    },
  { id: 'basketball', label: 'Basketball' },
  { id: 'lifestyle',  label: 'Lifestyle'  },
  { id: 'training',   label: 'Training'   },
  { id: 'casual',     label: 'Casual'     },
  { id: 'formal',     label: 'Formal'     },
];

export const HERO_SLIDES = [
  { brand: 'NIKE',        words: ['JUST', 'DO', 'IT'],            accent: 'IT',        sub: 'Air Max 2024 Collection',  img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80' },
  { brand: 'ADIDAS',      words: ['IMPOSSIBLE', 'IS', 'NOTHING'], accent: 'NOTHING',   sub: 'Ultraboost Series',        img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80' },
  { brand: 'NEW BALANCE', words: ['RUN', 'YOUR', 'WAY'],          accent: 'WAY',       sub: '990v6 Premium',            img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=900&q=80' },
  { brand: 'JORDAN',      words: ['BECOME', 'LEGENDARY'],         accent: 'LEGENDARY', sub: 'Air Jordan 1 Retro',       img: 'https://images.unsplash.com/photo-1556906781-9a412961a28c?w=900&q=80' },
];
