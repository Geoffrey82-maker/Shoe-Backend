import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';

export default function OrderSuccess() {
  const navigate   = useNavigate();
  const { state }  = useLocation();
  const order      = state?.order;

  return (
    <div
      style={{ paddingTop: 'var(--nav-h)' }}
      className="min-h-screen flex items-center justify-center px-4 bg-[--sf]"
    >
      <div className="max-w-md w-full text-center py-16 fade-in">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-[44px] font-black text-[--tx] tracking-tight mb-3 leading-tight">
          Order confirmed!
        </h1>

        <p className="text-[--tx-m] text-sm mb-2">
          Thank you for shopping with SoleStreet.
        </p>

        {order && (
          <p className="text-[--pr] font-bold text-lg mb-6">
            Order #{order.orderNumber}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-[--bd] my-6" />

        <p className="text-sm text-[--tx-m] mb-10 leading-relaxed max-w-xs mx-auto">
          A confirmation email has been sent to your inbox. Your shoes will be
          packed and shipped within 1–2 business days.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={() => navigate('/orders')}>
            <Package size={15} />
            Track my order
          </Button>
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Continue shopping
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
