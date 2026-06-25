import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck,
  Star, ChevronRight,
} from 'lucide-react';
import { Button, StarRating, Badge, Spinner } from '../components/common';
import ProductCard from '../components/shop/ProductCard';
import Footer from '../components/layout/Footer';
import { productAPI } from '../api/services';
import { useCartStore, useWishlistStore, useAuthStore } from '../store';
import { fmt, discount, firstImage } from '../utils';
import toast from 'react-hot-toast';

const TABS = ['description', 'specifications', 'reviews'];

const TRUST_BADGES = [
  { icon: Truck,       title: 'Free shipping', sub: 'On orders $100+' },
  { icon: RotateCcw,   title: '30-day returns', sub: 'Easy policy'    },
  { icon: ShieldCheck, title: '2-yr warranty',  sub: 'Guaranteed'     },
];

export default function ProductDetail() {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const { token } = useAuthStore();
  const { add }   = useCartStore();
  const { has, toggle } = useWishlistStore();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mainImg,  setMainImg]  = useState(0);
  const [selColor, setSelColor] = useState(null);
  const [selSize,  setSelSize]  = useState(null);
  const [qty,      setQty]      = useState(1);
  const [tab,      setTab]      = useState('description');
  const [adding,   setAdding]   = useState(false);
  const [revRating,  setRevRating]  = useState(0);
  const [revComment, setRevComment] = useState('');
  const [revLoading, setRevLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMainImg(0); setSelColor(null); setSelSize(null); setQty(1); setTab('description');

    (async () => {
      try {
        const data = await productAPI.getBySlug(slug);
        const p    = data.product;
        setProduct(p);
        setSelColor(p.colors?.[0] || null);
        const rel = await productAPI.getAll({ category: p.category, limit: 5 });
        setRelated((rel.products || []).filter((r) => r._id !== p._id).slice(0, 4));
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div style={{ paddingTop: 'var(--nav-h)' }}><Spinner size={40} /></div>;

  if (!product) return (
    <div style={{ paddingTop: 'var(--nav-h)' }} className="text-center py-32 text-[--tx-m]">
      Product not found.{' '}
      <button onClick={() => navigate('/shop')} className="text-[--pr] font-semibold hover:underline">
        Back to shop
      </button>
    </div>
  );

  const p      = product;
  const price  = p.discountPrice || p.price || 0;
  const disc   = discount(p.price, p.discountPrice);
  const inWish = has(p._id);
  const imgs   = p.images?.length ? p.images : [firstImage(null)];
  const inStock = (p.stock || 0) > 0;

  const handleAddToCart = async () => {
    if (!token) { navigate('/auth'); return; }
    if (p.sizes?.length && !selSize) { toast.error('Please select a size'); return; }
    setAdding(true);
    try {
      await add(p._id, selSize, selColor || '', qty);
      toast.success(`${p.name} added to cart!`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleWish = async () => {
    if (!token) { navigate('/auth'); return; }
    await toggle(p._id);
    toast.success(inWish ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReview = async () => {
    if (!token) { navigate('/auth'); return; }
    if (!revRating)           { toast.error('Please select a rating'); return; }
    if (!revComment.trim())   { toast.error('Please write a comment'); return; }
    setRevLoading(true);
    try {
      await productAPI.addReview(p._id, { rating: revRating, comment: revComment });
      toast.success('Review submitted!');
      setRevRating(0); setRevComment('');
      const data = await productAPI.getBySlug(slug);
      setProduct(data.product);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRevLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container py-8">

        {/* ── Breadcrumb ────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-[--tx-m] mb-8">
          <Link to="/"     className="hover:text-[--pr] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-[--pr] transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-[--pr] font-semibold truncate">{p.name}</span>
        </nav>

        {/* ── Product grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 mb-20">

          {/* Gallery */}
          <div>
            <div
              className="rounded-2xl overflow-hidden bg-[--sf] relative mb-3"
              style={{ aspectRatio: '1' }}
            >
              <img
                src={imgs[mainImg]}
                alt={p.name}
                className="w-full h-full object-cover"
              />
              {disc && (
                <div className="absolute top-4 left-4">
                  <Badge>{disc}% off</Badge>
                </div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      i === mainImg
                        ? 'border-[--pr]'
                        : 'border-[--bd] hover:border-[--pr]/40'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-[11px] font-bold text-[--pr] tracking-widest uppercase mb-1">
                  {p.brand}
                </p>
                <h1 className="font-display text-[38px] font-black text-[--tx] leading-tight tracking-tight">
                  {p.name}
                </h1>
              </div>
              <button
                onClick={handleWish}
                aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`mt-1 p-2.5 rounded-full border transition-all shrink-0 ${
                  inWish
                    ? 'bg-[--pr] border-[--pr] text-white'
                    : 'border-[--bd] text-[--tx-m] hover:border-[--pr] hover:text-[--pr]'
                }`}
              >
                <Heart size={18} fill={inWish ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={p.averageRating || 0} reviews={p.numReviews || 0} />
              <span className={`text-xs font-semibold ${
                (p.stock || 0) > 5 ? 'text-green-500'
                : (p.stock || 0) > 0 ? 'text-amber-500'
                : 'text-red-500'
              }`}>
                {(p.stock || 0) > 5 ? 'In stock'
                  : (p.stock || 0) > 0 ? `Only ${p.stock} left`
                  : 'Out of stock'
                }
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 bg-[--sf] rounded-xl px-5 py-4 mb-6">
              <span className="font-display text-[40px] font-black text-[--pr] leading-none">
                {fmt(price)}
              </span>
              {p.discountPrice && (
                <span className="text-xl text-[--tx-m] line-through">{fmt(p.price)}</span>
              )}
            </div>

            {/* Color selector */}
            {p.colors?.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-semibold text-[--tx] mb-2.5">
                  Color:{' '}
                  <span className="font-normal text-[--tx-m]">{selColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelColor(c)}
                      aria-pressed={selColor === c}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-medium border-2 transition-all ${
                        selColor === c
                          ? 'border-[--pr] bg-[--pr]/10 text-[--pr]'
                          : 'border-[--bd] text-[--tx] hover:border-[--pr]/40'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {p.sizes?.length > 0 && (
              <div className="mb-6">
                <p className="text-[12px] font-semibold text-[--tx] mb-2.5">
                  Size (US):{' '}
                  <span className="font-normal text-[--tx-m]">{selSize || 'Select'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelSize(s)}
                      aria-pressed={selSize === s}
                      className={`w-12 h-11 rounded-lg text-[13px] font-bold border-2 transition-all ${
                        selSize === s
                          ? 'bg-[--pr] border-[--pr] text-white'
                          : 'border-[--bd] text-[--tx] hover:border-[--pr]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity stepper */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex items-center border border-[--bd] rounded-full"
                role="group"
                aria-label="Quantity"
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 text-[18px] font-light text-[--tx] hover:text-[--pr] transition-colors"
                >
                  −
                </button>
                <span
                  className="w-8 text-center font-bold text-[--tx] text-sm"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 text-[18px] font-light text-[--tx] hover:text-[--pr] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mb-6">
              <Button
                full
                loading={adding}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingBag size={16} />
                {inStock ? 'Add to cart' : 'Out of stock'}
              </Button>
              <Button
                full
                variant="dark"
                onClick={handleBuyNow}
                disabled={!inStock || adding}
              >
                Buy now
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="bg-[--sf] rounded-xl p-3 text-center">
                  <Icon size={16} className="text-[--pr] mx-auto mb-1" />
                  <p className="text-[11px] font-semibold text-[--tx]">{title}</p>
                  <p className="text-[10px] text-[--tx-m]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="mb-20">
          <div className="flex border-b border-[--bd] mb-8" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-[13px] font-semibold capitalize transition-all border-b-2 -mb-px ${
                  tab === t
                    ? 'text-[--pr] border-[--pr]'
                    : 'text-[--tx-m] border-transparent hover:text-[--tx]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <p className="text-[--tx-m] leading-relaxed text-[14px] max-w-2xl">
              {p.description || 'No description available.'}
            </p>
          )}

          {tab === 'specifications' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              {[
                ['Brand',    p.brand],
                ['Category', p.category],
                ['Stock',    `${p.stock || 0} units`],
                ['Sizes',    p.sizes?.join(', ') || '—'],
                ['Colors',   p.colors?.join(', ') || '—'],
                ['Rating',   `${(p.averageRating || 0).toFixed(1)} / 5`],
              ].map(([k, v]) => (
                <div key={k} className="bg-[--sf] rounded-xl p-4">
                  <p className="text-[9px] font-bold text-[--tx-m] uppercase tracking-widest mb-1">{k}</p>
                  <p className="text-[13px] font-semibold text-[--tx] capitalize">{v || '—'}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="max-w-2xl">
              {/* Rating summary */}
              <div className="flex gap-8 items-center bg-[--sf] rounded-2xl p-6 mb-8">
                <div className="text-center shrink-0">
                  <p className="font-display text-[52px] font-black text-[--pr] leading-none">
                    {(p.averageRating || 0).toFixed(1)}
                  </p>
                  <StarRating rating={p.averageRating || 0} size={16} />
                  <p className="text-[11px] text-[--tx-m] mt-1">{p.numReviews || 0} reviews</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((s) => {
                    const count = (p.reviews || []).filter((r) => Math.round(r.rating) === s).length;
                    const pct   = p.numReviews ? (count / p.numReviews) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] text-[--tx-m] w-3 shrink-0">{s}</span>
                        <div className="flex-1 h-1.5 bg-[--bd] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[--pr] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write review */}
              {token && (
                <div className="bg-[--cd] border border-[--bd] rounded-2xl p-5 mb-6">
                  <p className="text-[13px] font-semibold text-[--tx] mb-3">Write a review</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => setRevRating(r)} aria-label={`Rate ${r} stars`}>
                        <Star
                          size={24}
                          className="transition-colors"
                          fill={revRating >= r ? 'var(--pr)' : 'none'}
                          stroke={revRating >= r ? 'var(--pr)' : 'var(--tx-m)'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Share your experience…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--sf] text-[--tx] text-sm resize-none focus:outline-none focus:border-[--pr] transition-colors mb-3 placeholder:text-[--tx-m]"
                  />
                  <Button size="sm" loading={revLoading} onClick={handleReview}>
                    Submit review
                  </Button>
                </div>
              )}

              {/* Review list */}
              {(p.reviews || []).length === 0
                ? <p className="text-[--tx-m] text-sm">No reviews yet. Be the first!</p>
                : (p.reviews || []).map((r, i) => (
                  <div key={i} className="border-b border-[--bd] py-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[--pr] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(r.name || 'U')[0]}
                        </div>
                        <span className="text-sm font-semibold text-[--tx]">{r.name || 'Anonymous'}</span>
                      </div>
                      <span className="text-xs text-[--tx-m]">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <StarRating rating={r.rating || 0} size={12} />
                    <p className="text-sm text-[--tx-m] mt-2 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* ── Related products ──────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-[32px] font-black text-[--tx] tracking-tight mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rp) => <ProductCard key={rp._id} product={rp} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
