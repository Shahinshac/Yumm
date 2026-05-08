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
  // --- AUTH & SESSIONS ---
  async verifySession() {
    if (IS_SUPABASE_ENABLED) {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    }
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // --- ORDERS ---
  async fetchOrders(): Promise<Order[]> {
    if (IS_PROD) {
      const res = await fetch(`${API_BASE}/orders`);
      return res.json();
    }
    if (IS_SUPABASE_ENABLED) {
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
    if (IS_SUPABASE_ENABLED) {
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
    if (IS_SUPABASE_ENABLED) {
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
    if (IS_SUPABASE_ENABLED) {
      await supabase.from('pending_partners').insert(data);
    } else {
      const applications = JSON.parse(localStorage.getItem('pendingPartners') || '[]');
      localStorage.setItem('pendingPartners', JSON.stringify([data, ...applications]));
    }
  },

  // --- REAL-TIME SUBSCRIPTION ---
  subscribeToOrders(callback: (payload: any) => void) {
    if (!IS_SUPABASE_ENABLED) return null;
    return supabase
      .channel('order-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe();
  }
};
