# SoleStreet — Premium Shoe Store

A full-stack e-commerce frontend built with React + Vite + Tailwind CSS, connected to your Express/MongoDB backend.

## Tech Stack
- **React 18** + **React Router v6** — multi-page SPA
- **Vite** — lightning-fast dev server & build
- **Tailwind CSS v3** — utility-first styling
- **Zustand** — global state (auth, cart, wishlist, theme)
- **Axios** — API client with JWT interceptors
- **Lucide React** — crisp icon set
- **React Hot Toast** — toast notifications

## Pages
| Route | Page |
|---|---|
| `/` | Home (hero slider, categories, featured, trending) |
| `/shop` | Shop (filters, search, sort — all URL-driven) |
| `/product/:slug` | Product detail (gallery, size/color, reviews) |
| `/cart` | Cart (quantity controls, coupon, order summary) |
| `/checkout` | Checkout (3-step: shipping → payment → review) |
| `/auth` | Login / Register |
| `/orders` | My orders |
| `/profile` | Account settings, security, preferences |
| `/order-success` | Post-purchase confirmation |

## Backend API (your repo at localhost:3500)
All calls use `VITE_API_URL`. JWT is stored in `localStorage` and attached automatically.

| Feature | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `/register`, `PUT /api/auth/profile` |
| Products | `GET /api/products`, `GET /api/products/:slug` |
| Cart | `GET/POST /api/cart`, `PUT/DELETE /api/cart/:itemId` |
| Orders | `POST /api/order`, `GET /api/order/my-orders` |
| Stripe | `POST /api/payments/stripe/create-payment-intent` |
| M-Pesa | `POST /api/payments/mpesa/stkpush` |
| Coupons | `POST /api/coupons/validate` |
| Wishlist | `GET/POST /api/wishlist` |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL and VITE_STRIPE_PUBLISHABLE_KEY

# 3. Start your backend (in its own terminal)
cd ../backend && npm run dev

# 4. Start frontend dev server
npm run dev
# → http://localhost:5173
```

## Build for Production

```bash
npm run build        # outputs to /dist
npm run preview      # preview the production build locally
```

## Deploy

**Vercel / Netlify:** Point to the `dist` folder, set env vars, add a rewrite rule:
```
/* → /index.html   (for client-side routing)
```

**Nginx example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3500/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```
