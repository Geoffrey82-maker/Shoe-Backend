import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Field } from '../components/common';
import { useAuthStore, useCartStore, useWishlistStore } from '../store';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { fetch: fetchCart } = useCartStore();
  const { fetch: fetchWish } = useWishlistStore();

  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [form,    setForm]    = useState({
    firstname: '', lastname: '', email: '', password: '',
  });

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await authAPI.register(form);
        toast.success('Account created! Please sign in.');
        setMode('login');
        setForm((f) => ({ ...f, password: '' }));
      } else {
        const data = await authAPI.login({ email: form.email, password: form.password });
        setAuth(data.user, data.token);
        toast.success(`Welcome back, ${data.user.firstname}!`);
        fetchCart();
        fetchWish();
        navigate('/');
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-[--sf]"
      style={{ paddingTop: 'var(--nav-h)' }}
    >
      <div className="w-full max-w-[420px] py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-0.5 mb-5">
            <span className="font-display text-[30px] font-black text-[--pr]">SOLE</span>
            <span className="font-display text-[30px] font-light text-[--tx]">STREET</span>
          </Link>
          <p className="text-[--tx-m] text-sm">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-[--cd] border border-[--bd] rounded-2xl p-7 shadow-[var(--shadow)]">
          {/* Mode toggle */}
          <div className="flex bg-[--sf] rounded-full p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-[13px] font-semibold rounded-full transition-all ${
                  mode === m
                    ? 'bg-[--pr] text-white shadow-sm'
                    : 'text-[--tx-m] hover:text-[--tx]'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  value={form.firstname}
                  onChange={(e) => setF('firstname', e.target.value)}
                  placeholder="Jane"
                  required
                />
                <Field
                  label="Last name"
                  value={form.lastname}
                  onChange={(e) => setF('lastname', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            )}

            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setF('email', e.target.value)}
              placeholder="you@example.com"
              required
            />

            {/* Password with show/hide toggle */}
            <div className="relative">
              <Field
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setF('password', e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-[34px] text-[--tx-m] hover:text-[--tx] transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-[--pr] hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button full type="submit" loading={loading} className="mt-2">
              {mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={15} />
            </Button>
          </form>

          {/* Switch mode link */}
          <p className="text-center text-xs text-[--tx-m] mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[--pr] font-semibold hover:underline underline-offset-2"
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
