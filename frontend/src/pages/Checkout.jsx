import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, CreditCard, Smartphone, Banknote,
  Lock, ChevronLeft, ArrowRight,
} from 'lucide-react';
import { Button, Field } from '../components/common';
import { useCartStore, useAuthStore } from '../store';
import { orderAPI, paymentAPI } from '../api/services';
import { fmt } from '../utils';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

const COUNTRIES = [
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda',
  'Nigeria', 'South Africa', 'Ghana', 'Ethiopia',
];

const PAY_METHODS = [
  {
    id:    'stripe',
    icon:  CreditCard,
    label: 'Card',
    sub:   'Visa, Mastercard, Amex',
  },
  {
    id:    'mpesa',
    icon:  Smartphone,
    label: 'M-Pesa',
    sub:   'STK push to your phone',
  },
  {
    id:    'cash_on_delivery',
    icon:  Banknote,
    label: 'Cash on delivery',
    sub:   'Pay when delivered',
  },
];

/* ── Step indicator ───────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                i + 1 < current
                  ? 'bg-[--pr] text-white'
                  : i + 1 === current
                  ? 'bg-[--pr] text-white ring-4 ring-[--pr]/20'
                  : 'bg-[--bd] text-[--tx-m]'
              }`}
            >
              {i + 1 < current ? <Check size={14} strokeWidth={2.5} /> : i + 1}
            </div>
            <span className={`text-[12px] font-semibold hidden sm:block ${
              i + 1 === current ? 'text-[--pr]' : 'text-[--tx-m]'
            }`}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                i + 1 < current ? 'bg-[--pr]' : 'bg-[--bd]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate  = useNavigate();
  const { token } = useAuthStore();
  const { items, clear } = useCartStore();

  const [step,    setStep]    = useState(1);
  const [busy,    setBusy]    = useState(false);
  const [pay,     setPay]     = useState('stripe');
  const [card,    setCard]    = useState({ number: '', expiry: '', cvc: '' });

  const [addr, setAddr] = useState({
    fullName: '', phone: '', email: '',
    address: '', city: '', postalCode: '', country: 'Kenya',
  });

  const setA = (k, v) => setAddr((a) => ({ ...a, [k]: v }));
  const setC = (k, v) => setCard((c) => ({ ...c, [k]: v }));

  if (!token) { navigate('/auth'); return null; }

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 12.99;
  const total    = subtotal + shipping;

  const validateShipping = () => {
    if (!addr.fullName || !addr.phone || !addr.address || !addr.city) {
      toast.error('Please fill all required fields');
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    setBusy(true);
    try {
      const data  = await orderAPI.create({
        shippingAddress: {
          fullName:   addr.fullName,
          phone:      addr.phone,
          address:    addr.address,
          city:       addr.city,
          postalCode: addr.postalCode,
          country:    addr.country,
        },
        paymentMethod: pay,
      });
      const order = data.order;

      if (pay === 'stripe') {
        try {
          await paymentAPI.createStripeIntent(order._id);
          toast.success('Stripe payment intent created.');
        } catch (e) {
          toast.error('Stripe: ' + e.message);
        }
      }

      if (pay === 'mpesa') {
        try {
          await paymentAPI.mpesaPush({ orderId: order._id, phone: addr.phone });
          toast.success(`STK push sent to ${addr.phone}`);
        } catch (e) {
          toast.error('M-Pesa: ' + e.message);
        }
      }

      clear();
      navigate('/order-success', { state: { order } });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  /* ── Order summary ──────────────────────────────────────── */
  const Summary = () => (
    <aside>
      <div className="bg-[--cd] border border-[--bd] rounded-2xl p-5 sticky top-[84px]">
        <h3 className="text-[14px] font-bold text-[--tx] mb-4">Order summary</h3>
        <div className="space-y-2.5 mb-4">
          {items.map((item) => (
            <div key={item._id} className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[--sf] shrink-0">
                <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[--tx] truncate">{item.name}</p>
                <p className="text-[11px] text-[--tx-m]">
                  US {item.size} · {item.color} · ×{item.quantity}
                </p>
              </div>
              <span className="text-[12px] font-bold text-[--tx] shrink-0">
                {fmt((item.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[--bd] pt-3 space-y-2">
          {[['Subtotal', fmt(subtotal)], ['Shipping', shipping === 0 ? 'Free' : fmt(shipping)]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-[12px] text-[--tx-m]">
              <span>{l}</span>
              <span className="font-semibold text-[--tx]">{v}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1 border-t border-[--bd]">
            <span className="font-bold text-[--tx] text-sm">Total</span>
            <span className="font-display text-[20px] font-black text-[--pr]">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }} className="min-h-screen">
      <div className="container py-10 max-w-5xl">
        <h1 className="font-display text-[44px] font-black text-[--tx] tracking-tight mb-8">
          Checkout
        </h1>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>

            {/* ── Step 1: Shipping ────────────────────── */}
            {step === 1 && (
              <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6 fade-in">
                <h2 className="text-[18px] font-bold text-[--tx] mb-5">Shipping address</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Full name *"    value={addr.fullName} onChange={(e) => setA('fullName', e.target.value)} placeholder="Jane Doe"    />
                  <Field label="Phone *"        type="tel" value={addr.phone} onChange={(e) => setA('phone', e.target.value)} placeholder="+254 712 000 000" />
                </div>
                <div className="mb-4">
                  <Field label="Email address" type="email" value={addr.email} onChange={(e) => setA('email', e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="mb-4">
                  <Field label="Street address *" value={addr.address} onChange={(e) => setA('address', e.target.value)} placeholder="123 Ngong Road" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Field label="City *"       value={addr.city}       onChange={(e) => setA('city', e.target.value)}       placeholder="Nairobi" />
                  <Field label="Postal code"  value={addr.postalCode} onChange={(e) => setA('postalCode', e.target.value)} placeholder="00100"   />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider">Country</label>
                    <select
                      value={addr.country}
                      onChange={(e) => setA('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] text-sm focus:outline-none focus:border-[--pr] transition-colors"
                    >
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <Button full onClick={() => validateShipping() && setStep(2)}>
                  Continue to payment <ArrowRight size={15} />
                </Button>
              </div>
            )}

            {/* ── Step 2: Payment ─────────────────────── */}
            {step === 2 && (
              <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6 fade-in">
                <h2 className="text-[18px] font-bold text-[--tx] mb-5">Payment method</h2>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {PAY_METHODS.map(({ id, icon: Icon, label, sub }) => (
                    <button
                      key={id}
                      onClick={() => setPay(id)}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center transition-all ${
                        pay === id
                          ? 'border-[--pr] bg-[--pr]/8'
                          : 'border-[--bd] hover:border-[--pr]/40'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`transition-colors ${pay === id ? 'text-[--pr]' : 'text-[--tx-m]'}`}
                      />
                      <span className={`text-[12px] font-bold ${pay === id ? 'text-[--pr]' : 'text-[--tx]'}`}>
                        {label}
                      </span>
                      <span className="text-[10px] text-[--tx-m] leading-tight">{sub}</span>
                    </button>
                  ))}
                </div>

                {/* Card fields */}
                {pay === 'stripe' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider mb-1.5 block">
                        Card number
                      </label>
                      <input
                        value={card.number}
                        onChange={(e) => setC('number', e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        inputMode="numeric"
                        className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] font-mono text-sm focus:outline-none focus:border-[--pr] transition-colors placeholder:text-[--tx-m]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider mb-1.5 block">Expiry</label>
                        <input
                          value={card.expiry}
                          onChange={(e) => setC('expiry', e.target.value)}
                          placeholder="MM / YY"
                          className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] font-mono text-sm focus:outline-none focus:border-[--pr] transition-colors placeholder:text-[--tx-m]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[--tx-m] uppercase tracking-wider mb-1.5 block">CVC</label>
                        <input
                          value={card.cvc}
                          onChange={(e) => setC('cvc', e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          inputMode="numeric"
                          className="w-full px-4 py-3 rounded-xl border border-[--bd] bg-[--cd] text-[--tx] font-mono text-sm focus:outline-none focus:border-[--pr] transition-colors placeholder:text-[--tx-m]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[--tx-m] bg-[--sf] rounded-xl px-4 py-3">
                      <Lock size={13} className="text-[--pr] shrink-0" />
                      Payments are encrypted end-to-end via Stripe.
                    </div>
                  </div>
                )}

                {pay === 'mpesa' && (
                  <div className="mb-6 space-y-3">
                    <Field
                      label="M-Pesa phone number"
                      type="tel"
                      value={addr.phone}
                      onChange={(e) => setA('phone', e.target.value)}
                      placeholder="254712345678"
                    />
                    <div className="flex items-center gap-2 text-[11px] text-[--tx-m] bg-[--sf] rounded-xl px-4 py-3">
                      <Smartphone size={13} className="text-[--pr] shrink-0" />
                      An STK push will be sent to complete payment of{' '}
                      <strong className="text-[--pr] ml-0.5">{fmt(total)}</strong>.
                    </div>
                  </div>
                )}

                {pay === 'cash_on_delivery' && (
                  <div className="flex flex-col items-center gap-3 bg-[--sf] rounded-xl p-8 mb-6 text-center">
                    <Banknote size={36} className="text-[--pr]" strokeWidth={1.5} />
                    <p className="font-semibold text-[--tx] text-sm">Pay on delivery</p>
                    <p className="text-[12px] text-[--tx-m] max-w-xs">
                      Our delivery team will collect payment when your order arrives.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft size={15} /> Back
                  </Button>
                  <Button full onClick={() => setStep(3)}>
                    Review order <ArrowRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review ──────────────────────── */}
            {step === 3 && (
              <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6 fade-in">
                <h2 className="text-[18px] font-bold text-[--tx] mb-5">Review your order</h2>

                {/* Shipping recap */}
                <div className="bg-[--sf] rounded-xl p-4 mb-5">
                  <p className="text-[10px] font-bold text-[--tx-m] uppercase tracking-widest mb-3">
                    Shipping to
                  </p>
                  <p className="text-[13px] font-semibold text-[--tx]">{addr.fullName}</p>
                  <p className="text-[12px] text-[--tx-m]">
                    {addr.address}, {addr.city}, {addr.country}
                  </p>
                  <p className="text-[12px] text-[--tx-m]">{addr.phone}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {(() => {
                      const pm = PAY_METHODS.find((m) => m.id === pay);
                      const Icon = pm?.icon;
                      return Icon ? <Icon size={12} className="text-[--pr]" /> : null;
                    })()}
                    <p className="text-[11px] text-[--pr] font-semibold">
                      {PAY_METHODS.find((m) => m.id === pay)?.label}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 items-center border-b border-[--bd] pb-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[--sf] shrink-0">
                        <img src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[--tx]">{item.name}</p>
                        <p className="text-[11px] text-[--tx-m]">
                          Size {item.size} · {item.color} · ×{item.quantity}
                        </p>
                      </div>
                      <span className="text-[13px] font-bold text-[--pr] shrink-0">
                        {fmt((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft size={15} /> Back
                  </Button>
                  <Button full loading={busy} onClick={placeOrder}>
                    Place order · {fmt(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Summary />
        </div>
      </div>
    </div>
  );
}
