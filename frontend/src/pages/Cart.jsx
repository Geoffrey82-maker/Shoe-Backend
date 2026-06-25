import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Check } from 'lucide-react';
import { Button, EmptyState, Spinner } from '../components/common';
import { useCartStore, useAuthStore } from '../store';
import { fmt } from '../utils';
import { couponAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate  = useNavigate();
  const { token } = useAuthStore();
  const { items, loading, fetch, update, remove } = useCartStore();

  const [coupon,       setCoupon]       = useState('');
  const [couponData,   setCouponData]   = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => { if (token) fetch(); }, [token]);

  if (!token) return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <EmptyState
        icon={<ShoppingBag size={36} />}
        title="Sign in to view your cart"
        desc="Your cart is saved when you're logged in."
        action={<Button onClick={() => navigate('/auth')}>Sign in</Button>}
      />
    </div>
  );

  if (loading) return <div style={{ paddingTop: 'var(--nav-h)' }}><Spinner /></div>;

  if (items.length === 0) return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <EmptyState
        icon={<ShoppingBag size={36} />}
        title="Your cart is empty"
        desc="Looks like you haven't added any shoes yet."
        action={<Button onClick={() => navigate('/shop')}>Start shopping</Button>}
      />
    </div>
  );

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 12.99;
  const discount = couponData?.discount || 0;
  const total    = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const data = await couponAPI.validate(coupon, subtotal);
      setCouponData(data);
      toast.success(`Coupon applied! You save ${fmt(data.discount)}`);
    } catch (e) {
      setCouponData(null);
      toast.error(e.message);
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }} className="min-h-screen">
      <div className="container py-10">
        <h1 className="font-display text-[44px] font-black text-[--tx] tracking-tight mb-8">
          Shopping cart{' '}
          <span className="text-[--pr]">({items.length})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

          {/* ── Cart items ──────────────────────────────── */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-[--cd] border border-[--bd] rounded-2xl p-5 grid grid-cols-[88px_1fr_auto] gap-4 items-center"
              >
                {/* Thumbnail */}
                <Link
                  to={`/product/${item.product?.slug || ''}`}
                  className="rounded-xl overflow-hidden bg-[--sf] block aspect-square shrink-0"
                >
                  <img
                    src={item.image || ''}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div>
                  <p className="text-[10px] font-bold text-[--pr] uppercase tracking-wider mb-0.5">
                    {item.brand || ''}
                  </p>
                  <Link
                    to={`/product/${item.product?.slug || ''}`}
                    className="text-[14px] font-semibold text-[--tx] hover:text-[--pr] transition-colors block mb-2"
                  >
                    {item.name}
                  </Link>
                  <div className="flex gap-2 mb-3">
                    <span className="text-[11px] bg-[--sf] px-2.5 py-1 rounded-full text-[--tx-m]">
                      US {item.size}
                    </span>
                    {item.color && (
                      <span className="text-[11px] bg-[--sf] px-2.5 py-1 rounded-full text-[--tx-m]">
                        {item.color}
                      </span>
                    )}
                  </div>
                  {/* Qty stepper */}
                  <div
                    className="flex items-center border border-[--bd] rounded-full w-fit"
                    role="group"
                    aria-label={`Quantity for ${item.name}`}
                  >
                    <button
                      onClick={() => update(item._id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 flex items-center justify-center text-[--tx] hover:text-[--pr] transition-colors text-[18px] font-light"
                    >
                      −
                    </button>
                    <span
                      className="w-7 text-center text-sm font-bold text-[--tx]"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => update(item._id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-8 h-8 flex items-center justify-center text-[--tx] hover:text-[--pr] transition-colors text-[18px] font-light"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + remove */}
                <div className="flex flex-col items-end justify-between self-stretch">
                  <button
                    onClick={() => remove(item._id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-[--tx-m] hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="text-[17px] font-black text-[--pr]">
                    {fmt((item.price || 0) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary ────────────────────────────── */}
          <aside>
            <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6 sticky top-[84px]">
              <h2 className="text-[17px] font-bold text-[--tx] mb-5">Order summary</h2>

              {/* Coupon input */}
              <div className="flex gap-2 mb-1">
                <div className="flex-1 flex items-center gap-2 border border-[--bd] rounded-xl px-3 py-2.5 focus-within:border-[--pr] transition-colors">
                  <Tag size={14} className="text-[--tx-m] shrink-0" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent text-sm text-[--tx] placeholder:text-[--tx-m] focus:outline-none"
                    aria-label="Coupon code"
                  />
                </div>
                <Button
                  size="sm"
                  variant="dark"
                  loading={couponLoading}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </div>

              {couponData && (
                <p className="text-xs text-green-500 font-semibold mb-4 ml-1 flex items-center gap-1">
                  <Check size={12} /> Saving {fmt(discount)}
                </p>
              )}

              {/* Line items */}
              <div className="space-y-3 mt-5">
                {[
                  ['Subtotal', fmt(subtotal)],
                  ['Shipping', shipping === 0 ? 'FREE' : fmt(shipping)],
                  ...(discount > 0 ? [['Discount', `−${fmt(discount)}`]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm text-[--tx-m]">
                    <span>{label}</span>
                    <span className={`font-semibold ${label === 'Discount' ? 'text-green-500' : 'text-[--tx]'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[--bd] mt-4 pt-4 flex justify-between items-center mb-5">
                <span className="font-bold text-[--tx]">Total</span>
                <span className="font-display text-[24px] font-black text-[--pr]">{fmt(total)}</span>
              </div>

              {subtotal < 100 && (
                <p className="text-xs text-[--tx-m] text-center mb-4">
                  Add {fmt(100 - subtotal)} more for free shipping
                </p>
              )}

              <Button full onClick={() => navigate('/checkout')}>
                Checkout <ArrowRight size={15} />
              </Button>
              <Button full variant="outline" className="mt-3" onClick={() => navigate('/shop')}>
                Continue shopping
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
