import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import {
  PageHeader, AdminBtn, SearchBar, StatusBadge, Modal, ASelect, AdminSpinner,
} from '../components/AdminUI';
import { adminAPI } from '../../api/services';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

const ORDER_STATUS = {
  pending:    { label: 'Pending',    color: '#f59e0b' },
  processing: { label: 'Processing', color: '#3b82f6' },
  shipped:    { label: 'Shipped',    color: '#8b5cf6' },
  delivered:  { label: 'Delivered',  color: '#22c55e' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444' },
};

const PAY_STATUS = {
  paid:     { label: 'Paid',     color: '#22c55e' },
  pending:  { label: 'Pending',  color: '#f59e0b' },
  failed:   { label: 'Failed',   color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#8b5cf6' },
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus,    setNewStatus]    = useState('');
  const [newPayStatus, setNewPayStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllOrders({ search, page });
      setOrders(data.orders || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const openOrder = (o) => {
    setSelected(o);
    setNewStatus(o.orderStatus);
    setNewPayStatus(o.payment?.status || 'pending');
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(selected._id, newStatus);
      toast.success('Order status updated');
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePay = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      await adminAPI.updatePayStatus(selected._id, newPayStatus);
      toast.success('Payment status updated');
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Orders"
        sub="Manage and update all customer orders"
        actions={
          <AdminBtn icon={RefreshCw} variant="outline" onClick={load} loading={loading}>
            Refresh
          </AdminBtn>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number…"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[--cd] border border-[--bd] rounded-2xl overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--bd] bg-[--sf]">
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[--tx-m] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-[--bd]">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
                : orders.length === 0
                ? <tr><td colSpan={8} className="text-center py-16 text-[--tx-m] text-sm">No orders found</td></tr>
                : orders.map(o => (
                  <tr key={o._id} className="border-b border-[--bd] last:border-0 hover:bg-[--sf]/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] font-bold text-[--tx]">#{o.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-[--tx]">{o.user?.firstname} {o.user?.lastname}</p>
                      <p className="text-[11px] text-[--tx-m]">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[--tx-m] whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[--tx-m]">{o.items?.length || 0}</td>
                    <td className="px-4 py-3 font-bold text-[--pr]">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.payment?.status || 'pending'} map={PAY_STATUS} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.orderStatus} map={ORDER_STATUS} />
                    </td>
                    <td className="px-4 py-3">
                      <AdminBtn size="sm" variant="outline" icon={Eye} onClick={() => openOrder(o)}>
                        Manage
                      </AdminBtn>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[--tx-m]">Page {page}</p>
        <div className="flex gap-2">
          <AdminBtn size="sm" variant="outline" icon={ChevronLeft} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </AdminBtn>
          <AdminBtn size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={orders.length < 10}>
            Next <ChevronRight size={13} />
          </AdminBtn>
        </div>
      </div>

      {/* Order detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Order #${selected?.orderNumber}`}
        footer={
          <>
            <AdminBtn variant="outline" onClick={() => setSelected(null)}>Cancel</AdminBtn>
            <AdminBtn loading={updating} onClick={handleUpdateStatus}>Save order status</AdminBtn>
            <AdminBtn variant="success" loading={updating} onClick={handleUpdatePay}>Save payment</AdminBtn>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Customer */}
            <div className="bg-[--sf] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[--tx-m] uppercase tracking-widest mb-2">Customer</p>
              <p className="font-semibold text-[--tx] text-sm">{selected.user?.firstname} {selected.user?.lastname}</p>
              <p className="text-[12px] text-[--tx-m]">{selected.user?.email}</p>
            </div>

            {/* Shipping */}
            <div className="bg-[--sf] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[--tx-m] uppercase tracking-widest mb-2">Shipping address</p>
              <p className="text-sm text-[--tx] font-semibold">{selected.shippingAddress?.fullName}</p>
              <p className="text-[12px] text-[--tx-m]">{selected.shippingAddress?.address}, {selected.shippingAddress?.city}</p>
              <p className="text-[12px] text-[--tx-m]">{selected.shippingAddress?.country} · {selected.shippingAddress?.phone}</p>
            </div>

            {/* Items */}
            <div>
              <p className="text-[10px] font-bold text-[--tx-m] uppercase tracking-widest mb-2">Items ({selected.items?.length})</p>
              <div className="space-y-2">
                {(selected.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-[--sf] rounded-xl">
                    <img src={item.image || ''} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-[--bd] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[--tx] truncate">{item.name}</p>
                      <p className="text-[11px] text-[--tx-m]">Size {item.size} · {item.color} · ×{item.quantity}</p>
                    </div>
                    <span className="text-[12px] font-bold text-[--pr] shrink-0">{fmt((item.price || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-[--sf] rounded-xl p-4 space-y-1.5">
              {[
                ['Subtotal', fmt(selected.subtotal)],
                ['Shipping', fmt(selected.shippingFee)],
                ...(selected.discountAmount > 0 ? [['Discount', `−${fmt(selected.discountAmount)}`]] : []),
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-[12px] text-[--tx-m]">
                  <span>{l}</span><span className="font-semibold text-[--tx]">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-[--bd] font-bold">
                <span className="text-[--tx]">Total</span>
                <span className="text-[--pr]">{fmt(selected.totalAmount)}</span>
              </div>
            </div>

            {/* Status controls */}
            <div className="grid grid-cols-2 gap-3">
              <ASelect
                label="Order status"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                options={Object.entries(ORDER_STATUS).map(([v, { label }]) => ({ value: v, label }))}
              />
              <ASelect
                label="Payment status"
                value={newPayStatus}
                onChange={e => setNewPayStatus(e.target.value)}
                options={Object.entries(PAY_STATUS).map(([v, { label }]) => ({ value: v, label }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
