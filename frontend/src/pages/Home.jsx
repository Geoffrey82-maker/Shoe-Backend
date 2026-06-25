import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Truck, RotateCcw, ShieldCheck, Zap,
} from 'lucide-react';
import Hero from '../components/home/Hero';
import ProductCard from '../components/shop/ProductCard';
import CategoryIcon from '../components/common/CategoryIcon';
import { SectionHeader, SkeletonCard, Button } from '../components/common';
import Footer from '../components/layout/Footer';
import { productAPI } from '../api/services';
import { CATEGORIES, BRANDS } from '../utils';

const PERKS = [
  { icon: Truck,        label: 'Free Shipping',  sub: 'On orders over $100'    },
  { icon: RotateCcw,    label: '30-Day Returns',  sub: 'Hassle-free policy'     },
  { icon: ShieldCheck,  label: 'Authenticity',    sub: '100% genuine products'  },
  { icon: Zap,          label: 'Fast Delivery',   sub: '2–4 business days'      },
];

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [feat, trend] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 4 }),
          productAPI.getAll({ sort: '-createdAt', limit: 8 }),
        ]);
        setFeatured(feat.products || []);
        setTrending(trend.products || []);
      } catch { /* backend offline — show empty gracefully */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <main>
      <Hero />

      {/* ── Perks bar ───────────────────────────────────── */}
      <div className="bg-[--pr]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {PERKS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 py-4 px-6 text-white">
                <Icon size={19} className="opacity-80 shrink-0" />
                <div>
                  <p className="text-[13px] font-bold leading-tight">{label}</p>
                  <p className="text-[11px] opacity-65">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ──────────────────────────────────── */}
      <section className="py-20 bg-[--sf]">
        <div className="container">
          <SectionHeader eyebrow="Browse by" title="Shop categories" center />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/shop?category=${c.id}`)}
                className="group bg-[--cd] border border-[--bd] rounded-2xl py-7 px-3 flex flex-col items-center gap-3 transition-all duration-200 hover:border-[--pr] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(232,68,26,.12)]"
              >
                <CategoryIcon
                  id={c.id}
                  size={26}
                  className="text-[--tx-m] group-hover:text-[--pr] transition-colors"
                />
                <span className="text-[13px] font-semibold text-[--tx] group-hover:text-[--pr] transition-colors">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured drops ───────────────────────────────── */}
      <section className="py-20">
        <div className="container">
          <SectionHeader
            eyebrow="Hand-picked"
            title="Featured drops"
            action={
              <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
                View all <ArrowRight size={14} />
              </Button>
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : featured.length > 0
              ? featured.map((p) => <ProductCard key={p._id} product={p} />)
              : (
                <div className="col-span-4 text-center py-16">
                  <p className="text-[--tx-m] text-sm">
                    Connect your backend at{' '}
                    <code className="text-[--pr] bg-[--sf] px-1.5 py-0.5 rounded text-xs">
                      localhost:3500
                    </code>{' '}
                    to load products.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )
            }
          </div>
        </div>
      </section>

      {/* ── Promo banner ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1a1a1a] py-24">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1556906781-9a412961a28c?w=1400&q=60)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 via-[#1a1a1a]/50 to-transparent" />

        <div className="container relative z-10 text-center text-white">
          <p className="text-[11px] font-bold tracking-[4px] text-[--pr] uppercase mb-4">
            Limited time
          </p>
          <h2 className="font-display text-[clamp(48px,8vw,80px)] font-black leading-tight tracking-tight mb-4">
            Up to <span className="text-[--pr]">50% off</span>
            <br />select styles
          </h2>
          <p className="text-white/55 mb-8 text-[15px]">Ends Sunday · While stocks last</p>
          <Button size="lg" onClick={() => navigate('/shop?sort=-price')}>
            Shop the sale <ArrowRight size={15} />
          </Button>
        </div>
      </section>

      {/* ── Trending ────────────────────────────────────── */}
      <section className="py-20 bg-[--sf]">
        <div className="container">
          <SectionHeader eyebrow="What's hot" title="Trending now" center />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : trending.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate('/shop')}>
              Browse all shoes <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Brand strip ─────────────────────────────────── */}
      <section className="py-14 border-t border-[--bd]">
        <div className="container">
          <p className="text-center text-[10px] font-bold tracking-[3px] text-[--tx-m] uppercase mb-8">
            Our brands
          </p>
          <div className="flex flex-wrap justify-between items-center gap-6">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => navigate(`/shop?brand=${b}`)}
                className="font-display text-[19px] font-extrabold text-[--tx-m] hover:text-[--pr] transition-colors tracking-wide"
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
