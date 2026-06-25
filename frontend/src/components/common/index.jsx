import { Loader2, Star } from 'lucide-react';

/* ── Button ─────────────────────────────────────────────── */
export function Button({
  children, variant = 'primary', size = 'md',
  loading, full, className = '', ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none';
  const variants = {
    primary: 'bg-[--pr] hover:bg-[--pr-d] text-white active:scale-[.98]',
    dark:    'bg-[--dk] hover:bg-[#333] text-white active:scale-[.98]',
    outline: 'border border-[--bd] hover:bg-[--pr] hover:text-white hover:border-[--pr] text-[--tx]',
    ghost:   'hover:bg-[--sf] text-[--tx]',
    danger:  'bg-red-500 hover:bg-red-600 text-white',
  };
  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-sm px-8 py-3.5',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

/* ── Badge ──────────────────────────────────────────────── */
export function Badge({ children, color = 'var(--pr)' }) {
  return (
    <span
      style={{ background: color }}
      className="inline-block text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
    >
      {children}
    </span>
  );
}

/* ── Star rating — uses Lucide Star icon ────────────────── */
export function StarRating({ rating = 0, size = 14, reviews }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className="transition-colors"
            fill={i <= Math.round(rating) ? 'var(--pr)' : 'none'}
            stroke={i <= Math.round(rating) ? 'var(--pr)' : 'var(--bd)'}
          />
        ))}
      </span>
      {reviews !== undefined && (
        <span style={{ fontSize: size - 2, color: 'var(--tx-m)' }} className="ml-0.5">
          ({reviews})
        </span>
      )}
    </span>
  );
}

/* ── Spinner ────────────────────────────────────────────── */
export function Spinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={size} className="animate-spin text-[--pr]" />
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[--sf] flex items-center justify-center text-[--tx-m] mb-2">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-[--tx]">{title}</h3>
      {desc && <p className="text-sm text-[--tx-m] max-w-xs">{desc}</p>}
      {action}
    </div>
  );
}

/* ── Section header ─────────────────────────────────────── */
export function SectionHeader({ eyebrow, title, center, action }) {
  return (
    <div className={`flex ${center ? 'flex-col items-center text-center' : 'justify-between items-end'} mb-10`}>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold tracking-[3px] text-[--pr] uppercase mb-2">{eyebrow}</p>
        )}
        <h2 className="font-display text-[42px] font-black text-[--tx] tracking-tight leading-none">{title}</h2>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ── Skeleton card ──────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="rounded-[14px] overflow-hidden border border-[--bd] bg-[--cd]">
      <div className="skeleton" style={{ paddingBottom: '76%' }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}

/* ── Input field ────────────────────────────────────────── */
export function Field({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider">{label}</label>
      )}
      <input
        className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors placeholder:text-[--tx-m]"
        {...props}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

/* ── Select field ───────────────────────────────────────── */
export function Select({ label, options = [], ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider">{label}</label>
      )}
      <select
        className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
