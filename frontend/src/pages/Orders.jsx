import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, XCircle, ChevronRight } from 'lucide-react';
import { Button, Spinner, EmptyState } from '../components/common';
import { orderAPI } from '../api/services';
import { useAuthStore } from '../store';
import { fmt, statusColor } from '../utils';
import toast from 'react-hot-toast';

export default function Orders() {
  const navigate  = useNavigate();
  const { token } = useAuthStore();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    (async () => {
      try {
        const data = await orderAPI.myOrders();
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const cancelOrder = async (id) => {
    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled');
      setOrders((prev) =>
        prev.map((o) => o._id === id ? { ...o, orderStatus: 'cancelled' } : o)
      );
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) return <div style={{ paddingTop: 'var(--nav-h)' }}><Spinner /></div>;

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }} className="min-h-screen">
      <div className="container py-10 max-w-3xl">
        <h1 className="font-display text-[42px] font-black text-[--tx] tracking-tight mb-2">
          My orders
        </h1>
        <p className="text-sm text-[--tx-m] mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>

        {orders.length === 0 ? (
          <EmptyState
            icon={<Package size={36} />}
            title="No orders yet"
            desc="When you place an order it will appear here."
            action={
              <Button onClick={() => navigate('/shop')}>
                Start shopping <ChevronRight size={14} />
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-[--cd] border border-[--bd] rounded-2xl p-5 transition-all hover:border-[--pr]/30 hover:shadow-sm"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="font-bold text-[--tx] text-[14px] tracking-wide">
                      #{o.orderNumber}
                    </p>
                    <p className="text-[11px] text-[--tx-m] mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                      {' · '}
                      {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Order status chip */}
                    <span
                      className="text-[11px] font-bold px-3 py-1 rounded-full capitalize"
                      style={{
                        background: (statusColor[o.orderStatus] || '#888') + '18',
                        color: statusColor[o.orderStatus] || '#888',
                      }}
                    >
                      {o.orderStatus}
                    </span>

                    {/* Payment status chip */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      o.payment?.status === 'paid'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {o.payment?.status || 'pending'}
                    </span>

                    {/* Total */}
                    <span className="font-display text-[19px] font-black text-[--pr]">
                      {fmt(o.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Item thumbnails */}
                {o.items?.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {o.items.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-[--sf] shrink-0 border border-[--bd]"
                      >
                        <img
                          src={item.image || ''}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {(o.items?.length || 0) > 5 && (
                      <div className="w-12 h-12 rounded-xl bg-[--sf] border border-[--bd] flex items-center justify-center text-[11px] font-bold text-[--tx-m] shrink-0">
                        +{o.items.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {['pending', 'processing'].includes(o.orderStatus) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelOrder(o._id)}
                    className="text-red-500 border-red-200 hover:bg-red-500 hover:border-red-500"
                  >
                    <XCircle size={13} />
                    Cancel order
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
