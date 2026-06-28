import { Loader2 } from 'lucide-react';

/* ── Stat card ──────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, sub, color = 'var(--pr)', loading }) {
  return (
    <div className="bg-[--cd] border border-[--bd] rounded-2xl p-5 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '18' }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[--tx-m] uppercase tracking-wide mb-1">{label}</p>
        {loading
          ? <div className="skeleton h-7 w-24 rounded mb-1" />
          : <p className="text-[26px] font-black text-[--tx] leading-none font-display tracking-tight">{value}</p>
        }
        {sub && <p className="text-[11px] text-[--tx-m] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Page header ────────────────────────────────────────── */
export function PageHeader({ title, sub, actions }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="font-display text-[32px] font-black text-[--tx] tracking-tight leading-tight">{title}</h1>
        {sub && <p className="text-sm text-[--tx-m] mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ── Admin button ───────────────────────────────────────── */
export function AdminBtn({ children, variant = 'primary', size = 'md', loading, icon: Icon, ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none';
  const variants = {
    primary:  'bg-[--pr] hover:bg-[--pr-d] text-white',
    outline:  'border border-[--bd] hover:border-[--pr] hover:text-[--pr] text-[--tx]',
    ghost:    'hover:bg-[--sf] text-[--tx]',
    danger:   'bg-red-500 hover:bg-red-600 text-white',
    success:  'bg-green-600 hover:bg-green-700 text-white',
  };
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-5 py-2.5' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}

/* ── Table ──────────────────────────────────────────────── */
export function Table({ cols, rows, loading, empty = 'No data found.' }) {
  return (
    <div className="bg-[--cd] border border-[--bd] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--bd] bg-[--sf]">
              {cols.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-left text-[10px] font-bold text-[--tx-m] uppercase tracking-widest whitespace-nowrap ${c.className || ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-[--bd]">
                  {cols.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <div className="skeleton h-4 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
              : rows.length === 0
              ? (
                <tr>
                  <td colSpan={cols.length} className="text-center py-16 text-[--tx-m] text-sm">{empty}</td>
                </tr>
              )
              : rows.map((row, i) => (
                <tr key={i} className="border-b border-[--bd] last:border-0 hover:bg-[--sf]/50 transition-colors">
                  {cols.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-[--tx] ${c.className || ''}`}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────── */
export function StatusBadge({ status, map }) {
  const cfg = map[status] || { label: status, color: '#888' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize tracking-wide"
      style={{ background: cfg.color + '20', color: cfg.color }}
    >
      {cfg.label || status}
    </span>
  );
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[--cd] border border-[--bd] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[--bd] shrink-0">
          <h2 className="font-bold text-[--tx] text-[16px]">{title}</h2>
          <button onClick={onClose} className="text-[--tx-m] hover:text-[--tx] transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-[--bd] flex items-center justify-end gap-2 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Admin input ────────────────────────────────────────── */
export function AField({ label, required, error, hint, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold text-[--tx-m] uppercase tracking-wider">
          {label}{required && <span className="text-[--pr] ml-0.5">*</span>}
        </label>
      )}
      <input
        className="w-full px-3.5 py-2.5 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors placeholder:text-[--tx-m]"
        {...props}
      />
      {hint  && <p className="text-[11px] text-[--tx-m]">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

/* ── Admin select ───────────────────────────────────────── */
export function ASelect({ label, required, options = [], ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold text-[--tx-m] uppercase tracking-wider">
          {label}{required && <span className="text-[--pr] ml-0.5">*</span>}
        </label>
      )}
      <select
        className="w-full px-3.5 py-2.5 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────────── */
export function AdminSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-[--pr]" />
    </div>
  );
}

/* ── Search bar ─────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-[--bd] bg-[--cd] text-sm text-[--tx] placeholder:text-[--tx-m] focus:outline-none focus:border-[--pr] transition-colors"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[--tx-m]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </div>
  );
}
