import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI, wishlistAPI } from '../api/services';

// ── Auth store ──────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('ss_token', token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem('ss_token');
        set({ user: null, token: null });
      },
    }),
    { name: 'ss-auth', partialize: (s) => ({ user: s.user, token: s.token }) }
  )
);

// ── Dark mode store ─────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark;
        document.documentElement.classList.toggle('dark', next);
        set({ dark: next });
      },
      init: () => {
        document.documentElement.classList.toggle('dark', get().dark);
      },
    }),
    { name: 'ss-theme' }
  )
);

// ── Cart store ──────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  items:   [],
  loading: false,

  fetch: async () => {
    if (!localStorage.getItem('ss_token')) return;
    set({ loading: true });
    try {
      const data = await cartAPI.get();
      set({ items: data.cart?.items || [] });
    } catch { /* guest cart stays empty */ }
    finally { set({ loading: false }); }
  },

  add: async (productId, size, color, quantity = 1) => {
    await cartAPI.add({ productId, size, color, quantity });
    get().fetch();
  },

  update: async (itemId, quantity) => {
    if (quantity < 1) {
      await cartAPI.remove(itemId);
    } else {
      await cartAPI.update(itemId, quantity);
    }
    get().fetch();
  },

  remove: async (itemId) => {
    await cartAPI.remove(itemId);
    get().fetch();
  },

  clear: () => set({ items: [] }),

  get count()  { return get().items.reduce((s, i) => s + i.quantity, 0); },
  get subtotal(){ return get().items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0); },
}));

// ── Wishlist store ──────────────────────────────────────
export const useWishlistStore = create((set, get) => ({
  ids: [],

  fetch: async () => {
    if (!localStorage.getItem('ss_token')) return;
    try {
      const data = await wishlistAPI.get();
      const ids = (data.wishlist?.products || []).map((p) => p._id || p);
      set({ ids });
    } catch {}
  },

  toggle: async (productId) => {
    if (!localStorage.getItem('ss_token')) return false;
    try {
      await wishlistAPI.toggle(productId);
    } catch {}
    get().fetch();
    return true;
  },

  has: (id) => get().ids.includes(id),
}));
