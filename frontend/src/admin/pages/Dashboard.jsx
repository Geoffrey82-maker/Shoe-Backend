import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Package, Users,
  TrendingUp, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { StatCard, StatusBadge, PageHeader } from '../components/AdminUI';
import { adminAPI } from '../../api/services';
import { fmt, statusColor } from '../../utils';
import { useAuthStore } from '../../store';

const ORDER_STATUS = {
  pending:    { label: 'Pending',    color: '#f59e0b' },
  processing: { label: 'Processing', color: '#3b82f6' },
  shipped:    { label: 'Shipped',    color: '#8b5cf6' },
  delivered:  { label: 'Delivered',  color: '#22c55e' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [sales,   setSales]   = useState([]);
  const [low,     setLow]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    (async () => {
      try {
        const [d, r, s, l] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getRecentOrders(),
          adminAPI.getMonthlySales(),
          adminAPI.getLowStock(),
        ]);
        setStats(d.stats);
        setRecent(r.orders || []);
        setSales(s.monthlySales || []);
        setLow(l.products || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build 12-month chart data
  const chartMax = Math.max(...sales.map(s => s.revenue), 1);
  const chartData = MONTHS.map((m, i) => {
    const found = sales.find(s => s.month === i + 1);
    return { month: m, revenue: found?.revenue || 0 };
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        sub={`Welcome back, ${user?.firstname}. Here's what's happening today.`}
      />

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign}   label="Total revenue"   value={fmt(stats?.totalRevenue || 0)}  sub="From paid orders"            color="#22c55e" loading={loading} />
        <StatCard icon={ShoppingCart} label="Total orders"    value={stats?.totalOrders ?? '—'}      sub={`${stats?.pendingOrders ?? 0} pending`}     color="var(--pr)" loading={loading} />
        <StatCard icon={Package}      label="Products"        value={stats?.totalProducts ?? '—'}    sub={`${low.length} low stock`}  color="#8b5cf6" loading={loading} />
        <StatCard icon={Users}        label="Customers"       value={stats?.totalUsers ?? '—'}       sub="Registered accounts"        color="#3b82f6" loading={loading} />
      </div>

      {/* ── Secondary stats ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Processing', value: stats?.processingOrders ?? '—', color: '#3b82f6' },
          { label: 'Shipped',    value: stats?.shippedOrders    ?? '—', color: '#8b5cf6' },
          { label: 'Delivered',  value: stats?.deliveredOrders  ?? '—', color: '#22c55e' },
          { label: 'Cancelled',  value: stats?.cancelledOrders  ?? '—', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="bg-[--cd] border border-[--bd] rounded-xl p-4 text-center">
            <p className="text-[11px] font-semibold text-[--tx-m] uppercase tracking-wide mb-1">{s.label}</p>
            {loading
              ? <div className="skeleton h-7 w-12 rounded mx-auto" />
              : <p className="font-display text-[28px] font-black" style={{ color: s.color }}>{s.value}</p>
            }
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* ── Revenue chart ──────────────────────────────── */}
        <div className="xl:col-span-2 bg-[--cd] border border-[--bd] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-[--tx] text-[15px]">Monthly Revenue</h2>
              <p className="text-[11px] text-[--tx-m]">Current year</p>
            </div>
            <TrendingUp size={18} className="text-[--pr]" />
          </div>
          {loading ? (
            <div className="flex items-end gap-2 h-40">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="skeleton flex-1 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-44">
              {chartData.map(({ month, revenue }) => {
                const pct = revenue > 0 ? (revenue / chartMax) * 100 : 2;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full relative" style={{ height: 160 }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[--pr]/15 hover:bg-[--pr]/25 rounded-t-lg transition-all duration-300 group-hover:bg-[--pr]/30"
                        style={{ height: `${pct}%`, minHeight: 4 }}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[--pr] rounded-t-lg transition-all duration-300"
                        style={{ height: `${pct * 0.6}%`, minHeight: 3 }}
                      />
                    </div>
                    <span className="text-[9px] text-[--tx-m] font-medium">{month}</span>
                    {revenue > 0 && (
                      <span className="text-[9px] text-[--pr] font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-6 bg-[--cd] px-1.5 py-0.5 rounded shadow-sm border border-[--bd] whitespace-nowrap z-10">
                        {fmt(revenue)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Low stock ──────────────────────────────────── */}
        <div className="bg-[--cd] border border-[--bd] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[--tx] text-[15px]">Low Stock Alert</h2>
              <p className="text-[11px] text-[--tx-m]">5 units or fewer</p>
            </div>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
            </div>
          ) : low.length === 0 ? (
            <p className="text-sm text-[--tx-m] text-center py-8">All products well stocked</p>
          ) : (
            <div className="space-y-2">
              {low.slice(0, 6).map(p => (
                <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[--sf] transition-colors">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[--sf] shrink-0">
                    <img src={p.images?.[0] || ''} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[--tx] truncate">{p.name}</p>
                    <p className="text-[10px] text-[--tx-m]">{p.brand}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))}
              <Link to="/admin/products" className="flex items-center justify-center gap-1.5 text-[12px] text-[--pr] font-semibold mt-2 py-2 hover:underline underline-offset-2">
                View all products <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────── */}
      <div className="bg-[--cd] border border-[--bd] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--bd]">
          <div>
            <h2 className="font-bold text-[--tx] text-[15px]">Recent Orders</h2>
            <p className="text-[11px] text-[--tx-m]">Last 10 orders placed</p>
          </div>
          <Link to="/admin/orders" className="flex items-center gap-1 text-[12px] text-[--pr] font-semibold hover:underline underline-offset-2">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--bd] bg-[--sf]">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[--tx-m] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[--bd]">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
                : recent.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-[--tx-m] text-sm">No orders yet</td></tr>
                : recent.map(o => (
                  <tr key={o._id} className="border-b border-[--bd] last:border-0 hover:bg-[--sf]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] font-semibold text-[--tx]">#{o.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-medium text-[--tx]">{o.user?.firstname} {o.user?.lastname}</p>
                      <p className="text-[11px] text-[--tx-m]">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[--tx-m] text-[12px]">{o.items?.length || 0}</td>
                    <td className="px-4 py-3 font-bold text-[--pr] text-[13px]">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.payment?.status || 'pending'} map={{
                        paid:    { label: 'Paid',    color: '#22c55e' },
                        pending: { label: 'Pending', color: '#f59e0b' },
                        failed:  { label: 'Failed',  color: '#ef4444' },
                        refunded:{ label: 'Refunded',color: '#8b5cf6' },
                      }} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.orderStatus} map={ORDER_STATUS} />
                    </td>
                    <td className="px-4 py-3">
                      <Link to="/admin/orders" className="text-[--pr] text-[11px] font-semibold hover:underline underline-offset-2 flex items-center gap-0.5">
                        View <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
