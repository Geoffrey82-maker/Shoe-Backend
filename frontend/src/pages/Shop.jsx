import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '../components/shop/ProductCard';
import { Button, Spinner, EmptyState, SkeletonCard } from '../components/common';
import Footer from '../components/layout/Footer';
import { productAPI } from '../api/services';
import { CATEGORIES, BRANDS } from '../utils';

const SORT_OPTIONS = [
  { value: '-createdAt',     label: 'Newest first'       },
  { value: 'price',          label: 'Price: Low to High' },
  { value: '-price',         label: 'Price: High to Low' },
  { value: '-averageRating', label: 'Top rated'          },
];

const SIZES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[--bd] pb-5 mb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-[11px] font-bold tracking-widest text-[--tx-m] uppercase group-hover:text-[--tx] transition-colors">
          {title}
        </span>
        {open
          ? <ChevronUp  size={14} className="text-[--tx-m]" />
          : <ChevronDown size={14} className="text-[--tx-m]" />
        }
      </button>
      {open && children}
    </div>
  );
}

export default function Shop() {
  const [params, setParams]     = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const keyword  = params.get('keyword')  || '';
  const category = params.get('category') || '';
  const brand    = params.get('brand')    || '';
  const sort     = params.get('sort')     || '-createdAt';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sizes    = params.getAll('size');

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const toggleSize = (s) => {
    const next    = new URLSearchParams(params);
    const current = next.getAll('size');
    next.delete('size');
    if (current.includes(String(s))) {
      current.filter((x) => x !== String(s)).forEach((x) => next.append('size', x));
    } else {
      [...current, String(s)].forEach((x) => next.append('size', x));
    }
    setParams(next);
  };

  const clearFilters = () => setParams(new URLSearchParams());
  const hasFilters   = keyword || category || brand || minPrice || maxPrice || sizes.length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (keyword)  query.keyword  = keyword;
      if (category) query.category = category;
      if (brand)    query.brand    = brand;
      if (sort)     query.sort     = sort;
      if (minPrice) query.minPrice = minPrice;
      if (maxPrice) query.maxPrice = maxPrice;

      const data  = await productAPI.getAll(query);
      let prods   = data.products || [];

      // Client-side size filter
      if (sizes.length) {
        prods = prods.filter((p) =>
          p.sizes?.some((s) => sizes.includes(String(s)))
        );
      }
      setProducts(prods);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, brand, sort, minPrice, maxPrice, sizes.join(',')]);

  useEffect(() => { load(); }, [load]);

  const pageTitle = category
    ? CATEGORIES.find((c) => c.id === category)?.label || category
    : brand || 'All Shoes';

  /* ── Shared filter panel ──────────────────────────────── */
  const FilterPanel = () => (
    <div>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs text-[--pr] font-semibold mb-5 hover:underline underline-offset-2"
        >
          <X size={13} /> Clear all filters
        </button>
      )}

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === c.id}
                onChange={() => setParam('category', category === c.id ? '' : c.id)}
                className="accent-[--pr] w-3.5 h-3.5"
              />
              <span className={`text-sm transition-colors ${
                category === c.id
                  ? 'text-[--pr] font-semibold'
                  : 'text-[--tx-m] group-hover:text-[--tx]'
              }`}>
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="brand"
                checked={brand === b}
                onChange={() => setParam('brand', brand === b ? '' : b)}
                className="accent-[--pr] w-3.5 h-3.5"
              />
              <span className={`text-sm transition-colors ${
                brand === b
                  ? 'text-[--pr] font-semibold'
                  : 'text-[--tx-m] group-hover:text-[--tx]'
              }`}>
                {b}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParam('minPrice', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors"
          />
          <span className="text-[--tx-m] text-sm shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParam('maxPrice', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors"
          />
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size (US)">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = sizes.includes(String(s));
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                aria-pressed={active}
                className={`w-11 h-9 rounded-lg text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-[--pr] text-white border-[--pr]'
                    : 'bg-transparent text-[--tx] border-[--bd] hover:border-[--pr] hover:text-[--pr]'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="container py-10">

        {/* ── Page header ───────────────────────────────── */}
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-[44px] font-black text-[--tx] tracking-tight leading-none mb-1">
              {pageTitle}
            </h1>
            <p className="text-sm text-[--tx-m]">{products.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[--tx] border border-[--bd] px-4 py-2.5 rounded-full hover:border-[--pr] hover:text-[--pr] transition-colors"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="text-sm border border-[--bd] bg-[--cd] text-[--tx] px-4 py-2.5 rounded-full focus:outline-none focus:border-[--pr] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Active filter chips ────────────────────────── */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-[--pr]/10 text-[--pr] font-semibold px-3 py-1.5 rounded-full">
                {category}
                <button onClick={() => setParam('category', '')} aria-label="Remove category filter">
                  <X size={11} />
                </button>
              </span>
            )}
            {brand && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-[--pr]/10 text-[--pr] font-semibold px-3 py-1.5 rounded-full">
                {brand}
                <button onClick={() => setParam('brand', '')} aria-label="Remove brand filter">
                  <X size={11} />
                </button>
              </span>
            )}
            {sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-[--pr]/10 text-[--pr] font-semibold px-3 py-1.5 rounded-full">
                US {s}
                <button onClick={() => toggleSize(s)} aria-label={`Remove size ${s} filter`}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* ── Sidebar — desktop ─────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[84px]">
              <FilterPanel />
            </div>
          </aside>

          {/* ── Product grid ─────────────────────────────── */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal size={32} />}
                title="No shoes found"
                desc="Try adjusting your filters or search differently."
                action={
                  <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ───────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute top-0 left-0 h-full w-[300px] bg-[--cd] shadow-2xl slide-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[--bd]">
              <span className="font-bold text-[--tx]">Filters</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[--tx-m] hover:text-[--tx] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel />
            </div>
            <div className="p-5 border-t border-[--bd]">
              <Button full onClick={() => setDrawerOpen(false)}>
                Show {products.length} results
              </Button>
            </div>
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
}
