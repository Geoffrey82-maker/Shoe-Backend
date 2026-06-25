import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, User, Search, Sun, Moon,
  ChevronRight, X, Menu, Zap,
} from 'lucide-react';
import { useAuthStore, useCartStore, useThemeStore } from '../../store';
import { BRANDS, CATEGORIES } from '../../utils';

const MEGA_MENU = {
  Men: {
    cats:     ['Running', 'Basketball', 'Training', 'Casual'],
    brands:   ['Nike', 'Adidas', 'Jordan', 'New Balance'],
    featured: { label: 'New Season Drop',   sub: 'Shop the latest arrivals'       },
  },
  Women: {
    cats:     ['Running', 'Training', 'Casual', 'Lifestyle'],
    brands:   ['Nike', 'Puma', 'Adidas', 'Reebok'],
    featured: { label: "Women's Edit",       sub: 'Fresh styles for every stride'  },
  },
  Kids: {
    cats:     ['Running', 'Casual', 'School'],
    brands:   ['Nike', 'Converse', 'Vans', 'Adidas'],
    featured: { label: 'Back to School',     sub: 'Gear up for the new term'       },
  },
  Brands: {
    cats:     BRANDS,
    brands:   [],
    featured: { label: 'All Brands',         sub: 'Browse by your favourite brand' },
  },
  Sale: {
    cats:     ['Up to 30% off', 'Up to 50% off', 'Clearance'],
    brands:   [],
    featured: { label: 'Flash Sale',         sub: 'Limited time offers'            },
  },
};

export default function Navbar() {
  const navigate   = useNavigate();
  const { user }   = useAuthStore();
  const { items }  = useCartStore();
  const { dark, toggle: toggleDark } = useThemeStore();

  const [mega,       setMega]       = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [scrolled,   setScrolled]   = useState(false);

  const timerRef  = useRef(null);
  const searchRef = useRef(null);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const isHome    = location.pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const openMega = (key) => { clearTimeout(timerRef.current); setMega(key); };
  const closeMega = () => { timerRef.current = setTimeout(() => setMega(null), 120); };
  const keepMega  = () => clearTimeout(timerRef.current);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQ.trim())}`);
      setSearchQ(''); setSearchOpen(false);
    }
  };

  const navTo = (path) => { setMega(null); setMobileOpen(false); navigate(path); };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent
            ? 'bg-transparent border-b border-transparent'
            : 'bg-[--cd]/95 backdrop-blur-xl border-b border-[--bd]'
        }`}
      >
        <div className="container flex items-center h-[68px] gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-0.5 shrink-0">
            <span className="font-display text-[26px] font-black text-[--pr] tracking-tight">SOLE</span>
            <span className={`font-display text-[26px] font-light tracking-tight transition-colors duration-300 ${transparent ? 'text-white' : 'text-[--tx]'}`}>
              STREET
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {Object.keys(MEGA_MENU).map((key) => (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => openMega(key)}
                onMouseLeave={closeMega}
              >
                <button
                  onClick={() => navTo(`/shop?category=${key.toLowerCase()}`)}
                  className={`px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-200 ${
                    mega === key
                      ? 'text-[--pr]'
                      : transparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-[--tx] hover:text-[--pr]'
                  }`}
                >
                  {key}
                </button>

                {/* Mega dropdown */}
                {mega === key && (
                  <div
                    onMouseEnter={keepMega}
                    onMouseLeave={closeMega}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-[--cd] border border-[--bd] rounded-2xl shadow-2xl p-6 fade-in z-50"
                  >
                    <div className="grid grid-cols-3 gap-5">
                      {/* Categories */}
                      <div>
                        <p className="text-[10px] font-bold text-[--pr] tracking-[2px] uppercase mb-3">
                          Categories
                        </p>
                        {MEGA_MENU[key].cats.map((c) => (
                          <button
                            key={c}
                            onClick={() => navTo(`/shop?category=${c.toLowerCase()}`)}
                            className="flex items-center gap-1 text-[13px] text-[--tx-m] hover:text-[--pr] transition-colors py-1 w-full text-left group"
                          >
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            {c}
                          </button>
                        ))}
                      </div>

                      {/* Brands */}
                      {MEGA_MENU[key].brands.length > 0 ? (
                        <div>
                          <p className="text-[10px] font-bold text-[--pr] tracking-[2px] uppercase mb-3">
                            Brands
                          </p>
                          {MEGA_MENU[key].brands.map((b) => (
                            <button
                              key={b}
                              onClick={() => navTo(`/shop?brand=${b}`)}
                              className="flex items-center gap-1 text-[13px] text-[--tx-m] hover:text-[--pr] transition-colors py-1 w-full text-left group"
                            >
                              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              {b}
                            </button>
                          ))}
                        </div>
                      ) : <div />}

                      {/* Featured card */}
                      <div className="bg-gradient-to-br from-[--pr] to-[--pr-d] rounded-xl p-4 text-white flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Zap size={11} className="opacity-75" />
                            <p className="text-[9px] font-bold tracking-[2px] uppercase opacity-75">Featured</p>
                          </div>
                          <p className="font-display text-xl font-black leading-tight mb-1">
                            {MEGA_MENU[key].featured.label}
                          </p>
                          <p className="text-[11px] opacity-75">{MEGA_MENU[key].featured.sub}</p>
                        </div>
                        <button
                          onClick={() => navTo('/shop')}
                          className="mt-4 bg-white text-[--pr] text-[11px] font-bold px-3 py-1.5 rounded-full self-start hover:scale-105 transition-transform inline-flex items-center gap-1"
                        >
                          Shop now <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2.5 rounded-full transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[--tx] hover:bg-[--sf]'}`}
              aria-label="Search"
            >
              <Search size={19} />
            </button>
            <button
              onClick={toggleDark}
              className={`p-2.5 rounded-full transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[--tx] hover:bg-[--sf]'}`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link
              to={user ? '/profile' : '/auth'}
              className={`p-2.5 rounded-full transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[--tx] hover:bg-[--sf]'}`}
              aria-label="Account"
            >
              <User size={19} />
            </Link>
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-full transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[--tx] hover:bg-[--sf]'}`}
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[--pr] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden p-2.5 rounded-full transition-colors ${transparent ? 'text-white hover:bg-white/10' : 'text-[--tx] hover:bg-[--sf]'}`}
              aria-label="Open menu"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-24 px-4 fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[--cd] rounded-2xl shadow-2xl flex items-center gap-3 px-5 py-4"
          >
            <Search size={18} className="text-[--tx-m] shrink-0" />
            <input
              ref={searchRef}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search for shoes, brands, styles…"
              className="flex-1 bg-transparent text-[--tx] text-sm placeholder:text-[--tx-m] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-[--tx-m] hover:text-[--tx] transition-colors"
            >
              <X size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-[300px] bg-[--cd] shadow-2xl slide-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[--bd]">
              <span className="font-display text-xl font-black">
                <span className="text-[--pr]">SOLE</span>
                <span className="text-[--tx] font-light">STREET</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-[--tx-m] hover:text-[--tx]">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              {Object.keys(MEGA_MENU).map((key) => (
                <button
                  key={key}
                  onClick={() => navTo(`/shop?category=${key.toLowerCase()}`)}
                  className="w-full text-left text-[14px] font-semibold text-[--tx] hover:text-[--pr] hover:bg-[--sf] px-4 py-3 rounded-xl transition-colors"
                >
                  {key}
                </button>
              ))}
              <hr className="border-[--bd] my-2" />
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navTo(`/shop?category=${c.id}`)}
                  className="w-full text-left text-[13px] text-[--tx-m] hover:text-[--pr] hover:bg-[--sf] px-4 py-2.5 rounded-xl transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </nav>
            <div className="p-5 border-t border-[--bd]">
              <Link to={user ? '/profile' : '/auth'} onClick={() => setMobileOpen(false)}>
                <button className="w-full bg-[--pr] text-white text-sm font-semibold py-3 rounded-full hover:bg-[--pr-d] transition-colors">
                  {user ? 'My Account' : 'Sign In'}
                </button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
