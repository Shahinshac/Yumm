import type { Order, Restaurant, PendingOwner, PendingPartner } from '../types';
import { supabase } from '../lib/supabase';

/**
 * NexFood Unified API Service
 * Automatically switches between Supabase (Live) and LocalStorage (Fallback).
 */

const IS_PROD = import.meta.env.PROD;
const API_BASE = '/api';
const IS_SUPABASE_ENABLED = !!import.meta.env.VITE_SUPABASE_URL;

export const ApiService = {
  // --- RESTAURANTS ---
  async fetchRestaurants(): Promise<Restaurant[]> {
    if (IS_PROD) {
      try {
        const res = await fetch(`${API_BASE}/restaurants`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      } catch (err) {
        console.error('Failed to fetch restaurants from API:', err);
        return JSON.parse(localStorage.getItem('restaurants') || '[]');
      }
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      const { data } = await supabase.from('restaurants').select('*');
      return data || [];
    }
    return JSON.parse(localStorage.getItem('restaurants') || '[]');
  },

  async createRestaurant(restaurant: Restaurant): Promise<void> {
    if (IS_PROD) {
      await fetch(`${API_BASE}/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restaurant),
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      await supabase.from('restaurants').insert({ ...restaurant, menu: JSON.stringify(restaurant.menu) });
    }
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<void> {
    if (IS_PROD) {
      await fetch(`${API_BASE}/restaurants`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      await supabase.from('restaurants').update(updates).eq('id', id);
    }
  },

  // --- AUTH & SESSIONS ---
  async verifySession() {
    if (IS_SUPABASE_ENABLED && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    }
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // --- ORDERS ---
  async fetchOrders(): Promise<Order[]> {
    if (IS_PROD) {
      try {
        const res = await fetch(`${API_BASE}/orders`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        return res.json();
      } catch (err) {
        console.error('API Fetch Failed:', err);
        const orders = localStorage.getItem('orders');
        return orders ? JSON.parse(orders) : [];
      }
    }

    if (IS_SUPABASE_ENABLED && supabase) {
      const { data } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      return data || [];
    }
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  },

  async createOrder(order: Order): Promise<void> {
    if (IS_PROD) {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      await supabase.from('orders').insert(order);
    } else {
      const orders = await this.fetchOrders();
      localStorage.setItem('orders', JSON.stringify([order, ...orders]));
    }
  },

  // --- APPROVALS ---
  async submitOwnerApplication(data: PendingOwner) {
    if (IS_PROD) {
      await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'owner', ...data })
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      await supabase.from('pending_owners').insert(data);
    } else {
      const applications = JSON.parse(localStorage.getItem('pendingOwners') || '[]');
      localStorage.setItem('pendingOwners', JSON.stringify([data, ...applications]));
    }
  },

  async submitPartnerApplication(data: PendingPartner) {
    if (IS_PROD) {
      await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'partner', ...data })
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      await supabase.from('pending_partners').insert(data);
    } else {
      const applications = JSON.parse(localStorage.getItem('pendingPartners') || '[]');
      localStorage.setItem('pendingPartners', JSON.stringify([data, ...applications]));
    }
  },

  async fetchPendingOwners(): Promise<PendingOwner[]> {
    if (IS_PROD) {
      try {
        const res = await fetch(`${API_BASE}/approvals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.owners || [];
      } catch (err) {
        console.error('Failed to fetch pending owners from API:', err);
        return JSON.parse(localStorage.getItem('pendingOwners') || '[]');
      }
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      const { data } = await supabase.from('pending_owners').select('*').order('registeredAt', { ascending: false });
      return data || [];
    }
    return JSON.parse(localStorage.getItem('pendingOwners') || '[]');
  },

  async fetchPendingPartners(): Promise<PendingPartner[]> {
    if (IS_PROD) {
      try {
        const res = await fetch(`${API_BASE}/approvals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.partners || [];
      } catch (err) {
        console.error('Failed to fetch pending partners from API:', err);
        return JSON.parse(localStorage.getItem('pendingPartners') || '[]');
      }
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      const { data } = await supabase.from('pending_partners').select('*').order('registeredAt', { ascending: false });
      return data || [];
    }
    return JSON.parse(localStorage.getItem('pendingPartners') || '[]');
  },

  async updateApprovalStatus(id: string, type: 'owner' | 'partner', status: string): Promise<void> {
    if (IS_PROD) {
      await fetch(`${API_BASE}/approvals`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, status }),
      });
      return;
    }
    if (IS_SUPABASE_ENABLED && supabase) {
      const table = type === 'owner' ? 'pending_owners' : 'pending_partners';
      await supabase.from(table).update({ status }).eq('id', id);
    }
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribeToOrders(callback: (payload: any) => void) {
    if (!IS_SUPABASE_ENABLED || !supabase) return null;
    return supabase
      .channel('order-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }
};

