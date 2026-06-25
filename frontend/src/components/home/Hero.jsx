import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../common';
import { HERO_SLIDES } from '../../utils';

export default function Hero() {
  const navigate = useNavigate();
  const [idx, setIdx]     = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((next) => {
    setFading(true);
    setTimeout(() => {
      setIdx(typeof next === 'function' ? next : next);
      setFading(false);
    }, 350);
  }, []);

  useEffect(() => {
    const t = setInterval(() => goTo((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [goTo]);

  const sl = HERO_SLIDES[idx];

  return (
    <section
      className="relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
      style={{ height: 'calc(100vh - 0px)', minHeight: 520 }}
      aria-label="Hero"
    >
      {/* Left panel */}
      <div className="relative bg-[#1a1a1a] flex flex-col justify-center px-10 lg:px-16 py-20 z-10">
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 56px)' }}
        />

        <div key={idx} className="relative fade-up">
          <p className="text-[11px] font-bold tracking-[4px] text-[--pr] uppercase mb-5">
            {sl.brand} — New arrival
          </p>

          <h1 className="font-display leading-[.88] tracking-tight text-white mb-6" style={{ fontSize: 'clamp(52px,7vw,96px)' }}>
            {sl.words.map((w, i) => (
              <span key={i} style={{ color: w === sl.accent ? 'var(--pr)' : '#fff' }}>
                {w}{' '}
              </span>
            ))}
          </h1>

          <p className="text-[15px] text-white/50 mb-10 leading-relaxed">{sl.sub}</p>

          <div className="flex gap-3 flex-wrap">
            <Button size="lg" onClick={() => navigate('/shop')}>Shop now</Button>
            <button
              onClick={() => navigate(`/shop?brand=${sl.brand}`)}
              className="px-8 py-3.5 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Explore
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-12" role="tablist" aria-label="Slides">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === idx}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === idx ? 28 : 6,
                  height: 6,
                  background: i === idx ? 'var(--pr)' : 'rgba(255,255,255,.22)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Prev / next arrows */}
        <button
          onClick={() => goTo((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 bottom-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => goTo((i) => (i + 1) % HERO_SLIDES.length)}
          className="absolute right-4 bottom-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Right panel — image */}
      <div className="relative hidden lg:block">
        <img
          key={idx}
          src={sl.img}
          alt={sl.brand}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:    fading ? 0 : 1,
            transform:  fading ? 'scale(1.04)' : 'scale(1)',
            transition: 'opacity .5s ease, transform .5s ease',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent" />

        {/* Thumb nav */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full overflow-hidden transition-all duration-300"
              style={{
                width:  36, height: 36,
                border: `2px solid ${i === idx ? 'var(--pr)' : 'rgba(255,255,255,.3)'}`,
              }}
              aria-label={`Go to ${s.brand} slide`}
            >
              <img src={s.img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
