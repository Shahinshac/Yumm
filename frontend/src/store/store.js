import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Register
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(data);
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed';
      set({ error });
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login({ username, password });
      localStorage.setItem('access_token', response.data.access_token);
      set({
        user: response.data.user,
        token: response.data.access_token,
        isAuthenticated: true,
      });
      return { success: true, role: response.data.user.role };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      set({ error });
      return { success: false, error };
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Check auth
  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await authAPI.getMe();
      set({
        user: response.data,
        token,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem('access_token');
      set({ isAuthenticated: false, user: null });
    }
  },
}));

// Cart store
export const useCartStore = create((set, get) => ({
  items: [],
  restaurant: null,

  addItem: (item) => {
    const { items, restaurant } = get();
    const existing = items.find((i) => i.id === item.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, qty: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQty: (id, qty) => {
    if (qty <= 0) {
      get().removeItem(id);
    } else {
      set({
        items: get().items.map((i) =>
          i.id === id ? { ...i, qty } : i
        ),
      });
    }
  },

  setRestaurant: (restaurant) => set({ restaurant }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.qty, 0);
  },

  clear: () => set({ items: [], restaurant: null }),
}));

// Orders store
export const useOrderStore = create((set) => ({
  orders: [],
  selectedOrder: null,

  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (order) => set({ selectedOrder: order }),
}));
