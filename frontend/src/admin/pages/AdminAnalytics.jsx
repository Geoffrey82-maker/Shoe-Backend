import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, RefreshCw } from 'lucide-react';
import { PageHeader, AdminBtn, AdminSpinner } from '../components/AdminUI';
import { adminAPI } from '../../api/services';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function MiniBar({ value, max, color = 'var(--pr)' }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex-1 h-1.5 bg-[--bd] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function AdminAnalytics() {
  const [stats,   setStats]   = useState(null);
  const [sales,   setSales]   = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [d, s, b] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getMonthlySales(),
        adminAPI.getBestSellers(),
      ]);
      setStats(d.stats);
      setSales(s.monthlySales || []);
      setSellers(b.bestSellers || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build full 12-month data
  const chartData = MONTHS.map((m, i) => {
    const found = sales.find(s => s.month === i + 1);
    return { month: m, revenue: found?.revenue || 0, idx: i };
  });
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  // YTD totals
  const ytdRevenue   = chartData.reduce((s, d) => s + d.revenue, 0);
  const activeMonths = chartData.filter(d => d.revenue > 0).length;
  const avgMonthly   = activeMonths > 0 ? ytdRevenue / activeMonths : 0;
  const bestMonth    = chartData.reduce((a, b) => b.revenue > a.revenue ? b : a, chartData[0]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Analytics"
        sub="Sales performance and revenue insights"
        actions={
          <AdminBtn icon={RefreshCw} variant="outline" onClick={load} loading={loading}>Refresh</AdminBtn>
        }
      />

      {/* ── KPI row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'YTD Revenue',     value: fmt(ytdRevenue),         sub: 'Paid orders only',         color: '#22c55e' },
          { label: 'Avg. / Month',    value: fmt(avgMonthly),         sub: `Over ${activeMonths} active months`, color: 'var(--pr)' },
          { label: 'Best month',      value: bestMonth?.month || '—', sub: bestMonth?.revenue > 0 ? fmt(bestMonth.revenue) : 'No data', color: '#8b5cf6' },
          { label: 'Total orders',    value: stats?.totalOrders ?? '—', sub: `${stats?.deliveredOrders ?? 0} delivered`, color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="bg-[--cd] border border-[--bd] rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-[--tx-m] uppercase tracking-wide mb-2">{k.label}</p>
            {loading
              ? <div className="skeleton h-8 w-28 rounded mb-1" />
              : <p className="font-display text-[30px] font-black leading-none mb-1" style={{ color: k.color }}>{k.value}</p>
            }
            <p className="text-[11px] text-[--tx-m]">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">

        {/* ── Monthly revenue chart ─────────────────────── */}
        <div className="xl:col-span-3 bg-[--cd] border border-[--bd] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[--tx] text-[16px]">Monthly Revenue</h2>
              <p className="text-[12px] text-[--tx-m] mt-0.5">Current calendar year</p>
            </div>
            <TrendingUp size={18} className="text-[--pr]" />
          </div>

          {loading ? (
            <div className="flex items-end gap-2 h-48">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${20 + Math.random() * 70}%` }} />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-end gap-1 h-48 mb-3">
                {chartData.map(({ month, revenue }) => {
                  const pct = (revenue / maxRevenue) * 100;
                  const isActive = revenue > 0;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-0 group relative" style={{ height: '100%' }}>
                      <div className="w-full relative flex-1">
                        {/* Background bar */}
                        <div className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-[--sf] h-full" />
                        {/* Revenue bar */}
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500"
                          style={{
                            height: isActive ? `${Math.max(pct, 3)}%` : '3%',
                            background: isActive ? 'var(--pr)' : 'var(--bd)',
                            opacity: isActive ? 1 : 0.4,
                          }}
                        />
                        {/* Hover tooltip */}
                        {isActive && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[--dk] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            {fmt(revenue)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1">
                {chartData.map(({ month }) => (
                  <div key={month} className="flex-1 text-center text-[9px] text-[--tx-m] font-medium">{month}</div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Order status breakdown ────────────────────── */}
        <div className="xl:col-span-2 bg-[--cd] border border-[--bd] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[--tx] text-[16px]">Order Breakdown</h2>
              <p className="text-[12px] text-[--tx-m] mt-0.5">By current status</p>
            </div>
            <ShoppingCart size={18} className="text-[--pr]" />
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-8 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Pending',    value: stats?.pendingOrders    || 0, color: '#f59e0b' },
                { label: 'Processing', value: stats?.processingOrders || 0, color: '#3b82f6' },
                { label: 'Shipped',    value: stats?.shippedOrders    || 0, color: '#8b5cf6' },
                { label: 'Delivered',  value: stats?.deliveredOrders  || 0, color: '#22c55e' },
                { label: 'Cancelled',  value: stats?.cancelledOrders  || 0, color: '#ef4444' },
              ].map(s => {
                const total = stats?.totalOrders || 1;
                const pct   = Math.round((s.value / total) * 100);
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-[--tx]">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[17px] font-black" style={{ color: s.color }}>{s.value}</span>
                        <span className="text-[10px] text-[--tx-m]">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-[--sf] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(pct, s.value > 0 ? 2 : 0)}%`, background: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paid vs pending */}
          {!loading && (
            <div className="mt-6 pt-5 border-t border-[--bd] grid grid-cols-2 gap-3">
              <div className="bg-green-50 dark:bg-green-900/15 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">Paid</p>
                <p className="font-display text-[22px] font-black text-green-600">{stats?.paidOrders || 0}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Unpaid</p>
                <p className="font-display text-[22px] font-black text-amber-600">
                  {(stats?.totalOrders || 0) - (stats?.paidOrders || 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Best sellers ─────────────────────────────────── */}
      <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-[--tx] text-[16px]">Best Selling Products</h2>
            <p className="text-[12px] text-[--tx-m] mt-0.5">Ranked by units sold</p>
          </div>
          <Package size={18} className="text-[--pr]" />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : sellers.length === 0 ? (
          <p className="text-sm text-[--tx-m] text-center py-10">No sales data yet.</p>
        ) : (
          <div className="space-y-3">
            {sellers.map((s, i) => {
              const maxSold = sellers[0]?.totalSold || 1;
              return (
                <div key={s._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[--sf] transition-colors group">
                  {/* Rank */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-600'
                      : i === 1 ? 'bg-slate-100 text-slate-500'
                      : i === 2 ? 'bg-orange-100 text-orange-600'
                      : 'bg-[--sf] text-[--tx-m]'
                    }`}
                  >
                    {i + 1}
                  </div>

                  {/* Product ID */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-mono text-[--tx-m] truncate">
                      Product ID: {String(s._id).slice(-8).toUpperCase()}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <MiniBar value={s.totalSold} max={maxSold} />
                    </div>
                  </div>

                  {/* Units */}
                  <div className="text-right shrink-0">
                    <p className="font-display text-[20px] font-black text-[--pr]">{s.totalSold}</p>
                    <p className="text-[10px] text-[--tx-m]">units sold</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
