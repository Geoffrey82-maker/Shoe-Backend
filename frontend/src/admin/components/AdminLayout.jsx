import { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Tag,
  BarChart3, LogOut, Menu, ChevronRight,
  Bell, Store, Users,
} from 'lucide-react';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/orders',    icon: ShoppingCart,    label: 'Orders'               },
  { to: '/admin/products',  icon: Package,         label: 'Products'             },
  { to: '/admin/coupons',   icon: Tag,             label: 'Coupons'              },
  { to: '/admin/analytics', icon: BarChart3,       label: 'Analytics'            },
];

function Sidebar({ collapsed, mobile, onClose, user, onLogout }) {
  return (
    <aside
      className={`flex flex-col h-full bg-[#0f0f0f] border-r border-white/6 transition-all duration-300 ${
        mobile ? 'w-64' : collapsed ? 'w-[68px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/6 shrink-0 ${collapsed && !mobile ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[--pr] flex items-center justify-center shrink-0">
          <Store size={16} className="text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="font-display text-[15px] font-black text-white tracking-tight leading-none">
              <span className="text-[--pr]">SOLE</span>STREET
            </p>
            <p className="text-[9px] text-white/35 tracking-widest uppercase">Admin CMS</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group
              ${isActive ? 'bg-[--pr] text-white' : 'text-white/50 hover:text-white hover:bg-white/6'}
              ${collapsed && !mobile ? 'justify-center' : ''}`
            }
          >
            <Icon size={17} className="shrink-0" />
            {(!collapsed || mobile) && (
              <>
                <span>{label}</span>
                <ChevronRight size={13} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className={`p-3 border-t border-white/6 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[--pr] flex items-center justify-center text-white text-xs font-bold shrink-0 select-none">
              {(user?.firstname || 'A')[0]}{(user?.lastname || '')[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{user?.firstname} {user?.lastname}</p>
              <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
            </div>
            <button onClick={onLogout} title="Sign out" className="text-white/30 hover:text-red-400 transition-colors shrink-0 p-1">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={onLogout} title="Sign out" className="p-2 text-white/30 hover:text-red-400 transition-colors">
            <LogOut size={17} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[--bg] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col">
        <Sidebar
          collapsed={collapsed}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 slide-in">
            <Sidebar mobile user={user} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-[--bd] bg-[--cd] flex items-center gap-4 px-5 shrink-0">
          <button
            onClick={() => window.innerWidth < 1024 ? setMobileOpen(true) : setCollapsed(c => !c)}
            className="text-[--tx-m] hover:text-[--tx] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-[--tx-m] hover:text-[--pr] transition-colors border border-[--bd] px-3 py-1.5 rounded-full"
          >
            <Store size={12} /> View store
          </Link>

          <button className="relative p-2 text-[--tx-m] hover:text-[--tx] transition-colors" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[--pr] rounded-full" aria-hidden />
          </button>

          <Link to="/profile" className="w-8 h-8 rounded-full bg-[--pr] flex items-center justify-center text-white text-xs font-bold select-none" aria-label="My profile">
            {(user?.firstname || 'A')[0]}
          </Link>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
