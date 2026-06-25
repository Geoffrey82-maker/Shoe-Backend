import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { CATEGORIES } from '../../utils';

/* ── Inline SVG social icons ──────────────────────────────── */
const SocialIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.18 8.18 0 0 0 4.77 1.52V6.8a4.85 4.85 0 0 1-1-.11z"/>
    </svg>
  ),
};

const LINKS = {
  Shop: CATEGORIES.map((c) => ({ label: c.label, to: `/shop?category=${c.id}` })),
  Help: [
    { label: 'FAQ',             to: '#' },
    { label: 'Shipping policy', to: '#' },
    { label: 'Return policy',   to: '#' },
    { label: 'Size guide',      to: '#' },
    { label: 'Contact us',      to: '#' },
  ],
  Company: [
    { label: 'About us',       to: '#' },
    { label: 'Careers',        to: '#' },
    { label: 'Press',          to: '#' },
    { label: 'Privacy policy', to: '#' },
    { label: 'Terms of use',   to: '#' },
  ],
};

const SOCIALS = [
  { Icon: SocialIcons.Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: SocialIcons.X,         href: 'https://x.com',         label: 'X (Twitter)' },
  { Icon: SocialIcons.Facebook,  href: 'https://facebook.com',  label: 'Facebook'   },
  { Icon: SocialIcons.TikTok,    href: 'https://tiktok.com',    label: 'TikTok'     },
];

const PAYMENT_LOGOS = ['Visa', 'Mastercard', 'M-Pesa', 'PayPal', 'Stripe'];

export default function Footer() {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer>
      {/* ── Newsletter ──────────────────────────────────── */}
      <div className="bg-[--dk] py-16">
        <div className="container max-w-xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[3px] text-[--pr] uppercase mb-3">
            Stay in the loop
          </p>
          <h2 className="font-display text-4xl font-black text-white leading-tight tracking-tight mb-3">
            Get the drop before anyone else
          </h2>
          <p className="text-sm text-white/50 mb-7">
            New releases, exclusive deals, style tips — straight to your inbox.
          </p>

          {subscribed ? (
            <div className="inline-flex items-center gap-2.5 bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-sm px-6 py-3 rounded-full">
              <Check size={15} strokeWidth={2.5} />
              You&apos;re subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 border border-white/15 text-white placeholder:text-white/35 text-sm px-5 py-3 rounded-full focus:outline-none focus:border-[--pr] transition-colors bg-white/5"
              />
              <button
                type="submit"
                className="bg-[--pr] hover:bg-[--pr-d] text-white px-5 py-3 rounded-full text-sm font-bold transition-colors shrink-0 flex items-center gap-2"
              >
                <Send size={14} />
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main footer ─────────────────────────────────── */}
      <div className="bg-[#0d0d0d] pt-14 pb-0">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand column */}
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-0.5 mb-5">
                <span className="font-display text-2xl font-black text-[--pr]">SOLE</span>
                <span className="font-display text-2xl font-light text-white">STREET</span>
              </Link>
              <p className="text-sm text-white/35 leading-relaxed max-w-[220px] mb-6">
                Premium footwear from the world&apos;s best brands. Authenticity guaranteed on every pair.
              </p>
              <div className="flex gap-2">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/7 flex items-center justify-center text-white/55 hover:bg-[--pr] hover:text-white transition-all duration-200"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([col, links]) => (
              <div key={col}>
                <h4 className="text-[10px] font-bold tracking-[1.5px] text-white uppercase mb-4">
                  {col}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-[12px] text-white/35 hover:text-[--pr] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/7 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-white/25">
              © {new Date().getFullYear()} SoleStreet. All rights reserved.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {PAYMENT_LOGOS.map((p) => (
                <span
                  key={p}
                  className="text-[10px] text-white/25 bg-white/5 px-2.5 py-1 rounded border border-white/8 tracking-wide"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
