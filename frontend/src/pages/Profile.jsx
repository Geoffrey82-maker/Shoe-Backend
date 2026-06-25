import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Settings, Package,
  LogOut, Sun, Moon, ChevronRight,
} from 'lucide-react';
import { Button, Field } from '../components/common';
import { authAPI } from '../api/services';
import { useAuthStore, useThemeStore } from '../store';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'profile',     icon: User,     label: 'Profile'     },
  { id: 'security',    icon: Lock,     label: 'Security'    },
  { id: 'preferences', icon: Settings, label: 'Preferences' },
];

/* ── Toggle switch ────────────────────────────────────────── */
function Toggle({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--pr] focus-visible:ring-offset-2"
      style={{ background: on ? 'var(--pr)' : 'var(--bd)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ left: on ? 28 : 4 }}
      />
    </button>
  );
}

/* ── Preference row ───────────────────────────────────────── */
function PrefRow({ title, desc, on, onChange }) {
  return (
    <div className="flex items-center justify-between bg-[--sf] rounded-xl px-5 py-4">
      <div>
        <p className="text-[14px] font-semibold text-[--tx]">{title}</p>
        <p className="text-[11px] text-[--tx-m] mt-0.5">{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} label={`Toggle ${title}`} />
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth } = useAuthStore();
  const { dark, toggle: toggleDark } = useThemeStore();

  const [tab,      setTab]      = useState('profile');
  const [profile,  setProfile]  = useState({ firstname: '', lastname: '', email: '', phone: '' });
  const [pwForm,   setPwForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [notifs,   setNotifs]   = useState({ email: true, sms: false, promo: true });

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    setProfile({
      firstname: user.firstname || '',
      lastname:  user.lastname  || '',
      email:     user.email     || '',
      phone:     user.phone     || '',
    });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await authAPI.update(profile);
      setAuth({ ...user, ...profile }, localStorage.getItem('ss_token'));
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Signed out');
    navigate('/');
  };

  if (!user) return null;

  const initials = `${(user.firstname || 'U')[0]}${(user.lastname || '')[0] || ''}`.toUpperCase();

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }} className="min-h-screen">
      <div className="container py-10">
        <h1 className="font-display text-[42px] font-black text-[--tx] tracking-tight mb-8">
          My account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">

          {/* ── Sidebar ───────────────────────────────── */}
          <aside>
            <div className="bg-[--cd] border border-[--bd] rounded-2xl p-5 sticky top-[84px]">

              {/* Avatar */}
              <div className="text-center mb-5 pb-5 border-b border-[--bd]">
                <div className="w-16 h-16 rounded-full bg-[--pr] flex items-center justify-center text-white font-black text-2xl mx-auto mb-3 select-none">
                  {initials}
                </div>
                <p className="font-semibold text-[--tx] text-[13px]">
                  {user.firstname} {user.lastname}
                </p>
                <p className="text-[11px] text-[--tx-m] truncate">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-block mt-2 text-[9px] font-bold bg-[--pr] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {TABS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${
                      tab === id
                        ? 'bg-[--pr]/12 text-[--pr]'
                        : 'text-[--tx-m] hover:bg-[--sf] hover:text-[--tx]'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    {label}
                    {tab === id && <ChevronRight size={12} className="ml-auto" />}
                  </button>
                ))}

                <div className="border-t border-[--bd] pt-2 mt-2">
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-[--tx-m] hover:bg-[--sf] hover:text-[--tx] transition-all"
                  >
                    <Package size={15} className="shrink-0" />
                    My orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 transition-all"
                  >
                    <LogOut size={15} className="shrink-0" />
                    Sign out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* ── Content panel ─────────────────────────── */}
          <div className="bg-[--cd] border border-[--bd] rounded-2xl p-6 lg:p-8">

            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="fade-in">
                <h2 className="text-[18px] font-bold text-[--tx] mb-6">Personal information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field
                    label="First name"
                    value={profile.firstname}
                    onChange={(e) => setProfile((p) => ({ ...p, firstname: e.target.value }))}
                    placeholder="Jane"
                  />
                  <Field
                    label="Last name"
                    value={profile.lastname}
                    onChange={(e) => setProfile((p) => ({ ...p, lastname: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-4 mb-7">
                  <Field
                    label="Email address"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                  <Field
                    label="Phone number"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+254 712 345 678"
                  />
                </div>
                <Button loading={saving} onClick={saveProfile}>
                  Save changes
                </Button>
              </div>
            )}

            {/* Security tab */}
            {tab === 'security' && (
              <div className="fade-in">
                <h2 className="text-[18px] font-bold text-[--tx] mb-2">Change password</h2>
                <p className="text-sm text-[--tx-m] mb-6">
                  Use a strong password with at least 6 characters.
                </p>
                <div className="space-y-4 max-w-sm mb-7">
                  <Field
                    label="Current password"
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <Field
                    label="New password"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <Field
                    label="Confirm new password"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <Button loading={pwSaving} onClick={changePassword}>
                  Update password
                </Button>
              </div>
            )}

            {/* Preferences tab */}
            {tab === 'preferences' && (
              <div className="fade-in space-y-4">
                <div className="mb-6">
                  <h2 className="text-[18px] font-bold text-[--tx] mb-1">Preferences</h2>
                  <p className="text-sm text-[--tx-m]">Manage your account settings and notifications.</p>
                </div>

                {/* Appearance */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[--tx-m] uppercase mb-3">Appearance</p>
                  <div className="flex items-center justify-between bg-[--sf] rounded-xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      {dark
                        ? <Moon size={17} className="text-[--pr]" />
                        : <Sun  size={17} className="text-[--pr]" />
                      }
                      <div>
                        <p className="text-[14px] font-semibold text-[--tx]">
                          {dark ? 'Dark mode' : 'Light mode'}
                        </p>
                        <p className="text-[11px] text-[--tx-m]">
                          Currently using {dark ? 'dark' : 'light'} theme
                        </p>
                      </div>
                    </div>
                    <Toggle on={dark} onChange={toggleDark} label="Toggle dark mode" />
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[--tx-m] uppercase mb-3">Notifications</p>
                  <div className="space-y-2">
                    <PrefRow
                      title="Email notifications"
                      desc="Order confirmations and shipping updates"
                      on={notifs.email}
                      onChange={() => setNotifs((n) => ({ ...n, email: !n.email }))}
                    />
                    <PrefRow
                      title="SMS alerts"
                      desc="Delivery status via text message"
                      on={notifs.sms}
                      onChange={() => setNotifs((n) => ({ ...n, sms: !n.sms }))}
                    />
                    <PrefRow
                      title="Promotions"
                      desc="Exclusive deals and new arrivals"
                      on={notifs.promo}
                      onChange={() => setNotifs((n) => ({ ...n, promo: !n.promo }))}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => toast.success('Preferences saved!')}
                  className="mt-2"
                >
                  Save preferences
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
