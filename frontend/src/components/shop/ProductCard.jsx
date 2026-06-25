import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { StarRating, Badge } from '../common';
import { useWishlistStore, useCartStore, useAuthStore } from '../../store';
import { fmt, discount, firstImage } from '../../utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product: p }) {
  const [hovered, setHovered] = useState(false);
  const { has, toggle } = useWishlistStore();
  const { add }         = useCartStore();
  const { token }       = useAuthStore();

  if (!p) return null;

  const price  = p.discountPrice || p.price || 0;
  const disc   = discount(p.price, p.discountPrice);
  const inWish = has(p._id);
  const img    = firstImage(p.images);
  const inStock = (p.stock || 0) > 0;

  const handleWish = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Sign in to save items'); return; }
    const ok = await toggle(p._id);
    if (ok) toast.success(inWish ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!token)  { toast.error('Sign in to add to cart'); return; }
    if (!inStock) return;
    try {
      await add(p._id, p.sizes?.[0], p.colors?.[0] || '', 1);
      toast.success(`${p.name} added to cart`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group bg-[--cd] border rounded-[14px] overflow-hidden transition-all duration-250 ${
        hovered
          ? 'border-[--pr] -translate-y-1 shadow-[0_12px_32px_rgba(232,68,26,.12)]'
          : 'border-[--bd]'
      }`}
    >
      {/* ── Image ─────────────────────────────────────── */}
      <Link
        to={`/product/${p.slug}`}
        className="block relative overflow-hidden bg-[--sf]"
        style={{ paddingBottom: '76%' }}
      >
        <img
          src={img}
          alt={p.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-400 ${
            hovered ? 'scale-[1.07]' : 'scale-100'
          }`}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {disc      && <Badge>{disc}% off</Badge>}
          {p.featured && <Badge color="#1a1a1a">Featured</Badge>}
          {!inStock   && <Badge color="#6b7280">Sold out</Badge>}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWish}
          aria-label={inWish ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            inWish
              ? 'bg-[--pr] text-white'
              : 'bg-white/90 text-[--tx-m] hover:bg-[--pr] hover:text-white'
          }`}
        >
          <Heart size={14} fill={inWish ? 'currentColor' : 'none'} />
        </button>

        {/* Quick-add overlay */}
        {hovered && inStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 left-3 right-3 bg-[--pr] hover:bg-[--pr-d] text-white text-[12px] font-bold py-2.5 rounded-full flex items-center justify-center gap-2 fade-up transition-colors"
          >
            <ShoppingBag size={13} />
            Quick add
          </button>
        )}
      </Link>

      {/* ── Info ──────────────────────────────────────── */}
      <Link to={`/product/${p.slug}`} className="block p-4">
        <p className="text-[10px] font-bold text-[--pr] tracking-wider uppercase mb-1">{p.brand}</p>
        <h3 className="text-[14px] font-semibold text-[--tx] leading-snug mb-2 line-clamp-1">{p.name}</h3>
        <StarRating rating={p.averageRating || 0} reviews={p.numReviews || 0} size={11} />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[17px] font-black text-[--pr]">{fmt(price)}</span>
          {p.discountPrice && (
            <span className="text-[12px] text-[--tx-m] line-through">{fmt(p.price)}</span>
          )}
        </div>
      </Link>
    </article>
  );
}
