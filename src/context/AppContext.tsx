import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { 
  MenuItem, Restaurant, CartItem, OrderStatus, Order, 
  PendingOwner, PendingPartner, Notification 
} from '../types';

interface AppContextType {
  restaurants: Restaurant[];
  cart: CartItem[];
  orders: Order[];
  addToCart: (item: MenuItem, portion?: Portion) => void;
  removeFromCart: (itemId: string, portionLabel?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  placeOrder: (restaurantId: string, address: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentUser: { role: string; name: string; email?: string; id?: string } | null;
  login: (role: string, name: string, email?: string) => boolean;
  logout: () => void;
  pendingOwners: PendingOwner[];
  pendingPartners: PendingPartner[];
  registerOwner: (data: Omit<PendingOwner, 'id' | 'status' | 'registeredAt'>) => void;
  registerPartner: (data: Omit<PendingPartner, 'id' | 'status' | 'registeredAt'>) => void;
  approveOwner: (id: string) => void;
  rejectOwner: (id: string) => void;
  approvePartner: (id: string) => void;
  rejectPartner: (id: string) => void;
  notifications: Notification[];
  showNotification: (message: string, type?: Notification['type']) => void;
  isApproved: (role: string, email?: string, name?: string) => boolean;
  userLocation: string;
  updateLocation: () => void;
  clearAllData: () => void;
  addMenuItem: (restaurantId: string, item: Omit<MenuItem, 'id'>) => void;
  removeMenuItem: (restaurantId: string, itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const load = (key: string, def: any) => {
    const saved = localStorage.getItem(key);
    if (!saved) return def;
    try {
      const parsed = JSON.parse(saved);
      if (key === 'orders' && Array.isArray(parsed)) {
        return parsed.map((o: any) => ({ ...o, createdAt: new Date(o.createdAt || Date.now()) }));
      }
      if ((key === 'pendingOwners' || key === 'pendingPartners') && Array.isArray(parsed)) {
        return parsed.map((o: any) => ({ ...o, registeredAt: new Date(o.registeredAt || Date.now()) }));
      }
      return parsed;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage:`, e);
      return def;
    }
  };

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => load('restaurants', []));
  const [cart, setCart] = useState<CartItem[]>(() => load('cart', []));
  const [orders, setOrders] = useState<Order[]>(() => load('orders', []));
  const [currentUser, setCurrentUser] = useState<any>(() => load('user', null));
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>(() => load('pendingOwners', []));
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>(() => load('pendingPartners', []));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userLocation, setUserLocation] = useState<string>(() => localStorage.getItem('location') || 'Fetching location...');

  const updateLocation = async () => {
    if ("geolocation" in navigator) {
      setUserLocation('Fetching location...');
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const addr = data.address.city || data.address.town || data.address.suburb || data.address.road || 'Current Location';
          const fullAddr = `${addr}, ${data.address.country}`;
          setUserLocation(fullAddr);
          localStorage.setItem('location', fullAddr);
        } catch (err) {
          const loc = `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
          setUserLocation(loc);
        }
      }, () => setUserLocation('Location permission denied'));
    }
  };

  useEffect(() => {
    const sync = async () => {
      try {
        const [o, p, ords] = await Promise.all([
          ApiService.fetchPendingOwners(),
          ApiService.fetchPendingPartners(),
          ApiService.fetchOrders()
        ]);
        if (Array.isArray(o)) setPendingOwners(o);
        if (Array.isArray(p)) setPendingPartners(p);
        if (Array.isArray(ords)) setOrders(ords);
      } catch (err) { 
        console.error('Background synchronization failed. System operating in local-first mode.', err); 
      }
    };

    sync();
    if (userLocation === 'Fetching location...') updateLocation();
  }, []);

  useEffect(() => localStorage.setItem('restaurants', JSON.stringify(restaurants)), [restaurants]);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('user', JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem('pendingOwners', JSON.stringify(pendingOwners)), [pendingOwners]);
  useEffect(() => localStorage.setItem('pendingPartners', JSON.stringify(pendingPartners)), [pendingPartners]);

  const showNotification = (message: string, type: Notification['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addToCart = (item: MenuItem, portion?: Portion) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem.id === item.id && c.selectedPortion?.label === portion?.label);
      if (ex) {
        return prev.map(c => (c.menuItem.id === item.id && c.selectedPortion?.label === portion?.label) ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1, selectedPortion: portion }];
    });
    showNotification(`${item.name} ${portion ? `(${portion.label})` : ''} added to basket`);
  };

  const removeFromCart = (itemId: string, portionLabel?: string) => 
    setCart(prev => prev.filter(c => !(c.menuItem.id === itemId && c.selectedPortion?.label === portionLabel)));

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, i) => {
    const price = i.selectedPortion ? i.selectedPortion.price : i.menuItem.price;
    return s + price * i.quantity;
  }, 0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = (restaurantId: string, address: string) => {
    const r = restaurants.find(r => r.id === restaurantId);
    const order: Order = {
      id: `ORD-${Math.floor(Math.random()*9000)+1000}`,
      restaurantId, restaurantName: r?.name || 'Restaurant',
      items: [...cart], status: 'pending',
      total: cartTotal + 4.99 + 2.50, // Fees
      createdAt: new Date(), address,
      customerName: currentUser?.name,
    };
    setOrders(prev => [order, ...prev]);
    clearCart();
    showNotification('Order placed successfully!', 'success');
    return order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showNotification(`Order status updated to ${status}`, 'info');
  };

  const login = (role: string, name: string, email?: string) => {
    if (role === 'owner') {
      const approval = pendingOwners.find(o => o.email === email || o.name === name);
      if (!approval || approval.status !== 'approved') {
        showNotification('Access Denied: Account pending approval.', 'error');
        return false;
      }
      setCurrentUser({ role, name, email, id: approval.id });
    } else if (role === 'partner') {
      const approval = pendingPartners.find(p => p.email === email || p.name === name);
      if (!approval || approval.status !== 'approved') {
        showNotification('Access Denied: Account pending approval.', 'error');
        return false;
      }
      setCurrentUser({ role, name, email, id: approval.id });
    } else {
      setCurrentUser({ role, name, email });
    }
    showNotification(`Logged in as ${name}`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    showNotification('Securely logged out', 'info');
  };

  const addMenuItem = (restaurantId: string, item: Omit<MenuItem, 'id'>) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, menu: [...r.menu, { ...item, id: `item-${Date.now()}` }] } : r));
    showNotification('Menu item added successfully');
  };

  const removeMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, menu: r.menu.filter(i => i.id !== itemId) } : r));
    showNotification('Item removed from menu');
  };

  const approveOwner = (id: string) => {
    setPendingOwners(prev => prev.map(o => {
      if (o.id === id) {
        const r: Restaurant = {
          id: `res-${Date.now()}`,
          ownerId: id,
          name: o.restaurantName,
          cuisine: o.cuisineType,
          rating: 4.5,
          reviewCount: 0,
          deliveryTime: '25-35 min',
          deliveryFee: 'Free',
          imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop',
          menu: [],
          status: 'active'
        };
        setRestaurants(prevR => [...prevR, r]);
        return { ...o, status: 'approved' };
      }
      return o;
    }));
    showNotification('Owner approved and restaurant created');
  };

  const registerOwner = async (data: any) => {
    const entry = { ...data, id: `OWN-${Date.now()}`, status: 'pending', registeredAt: new Date() };
    setPendingOwners(prev => [entry, ...prev]);
    try {
      await ApiService.submitOwnerApplication(entry);
      showNotification('Enterprise registration submitted and synced');
    } catch (err) {
      console.warn('Network sync failed, registration saved locally', err);
      showNotification('Registration saved locally');
    }
  };

  const registerPartner = async (data: any) => {
    const entry = { ...data, id: `DRV-${Date.now()}`, status: 'pending', registeredAt: new Date() };
    setPendingPartners(prev => [entry, ...prev]);
    try {
      await ApiService.submitPartnerApplication(entry);
      showNotification('Logistics application submitted and synced');
    } catch (err) {
      console.warn('Network sync failed, application saved locally', err);
      showNotification('Application saved locally');
    }
  };


  const rejectOwner = (id: string) => setPendingOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
  const approvePartner = (id: string) => setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  const rejectPartner = (id: string) => setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));

  const isApproved = (role: string, email?: string, name?: string) => {
    if (role === 'customer' || role === 'admin') return true;
    const approval = role === 'owner' ? pendingOwners.find(o => o.email === email || o.name === name) : pendingPartners.find(p => p.email === email || p.name === name);
    return approval?.status === 'approved';
  };

  const clearAllData = () => {
    localStorage.clear();
    showNotification('System Reset', 'info');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <AppContext.Provider value={{
      restaurants, cart, orders, addToCart, removeFromCart, clearCart,
      cartTotal, cartCount, placeOrder, updateOrderStatus,
      currentUser, login, logout,
      pendingOwners, pendingPartners,
      registerOwner, registerPartner,
      approveOwner, rejectOwner, approvePartner, rejectPartner,
      notifications, showNotification,
      isApproved,
      userLocation, updateLocation,
      clearAllData,
      addMenuItem, removeMenuItem,
    }}>
      {children}
      <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-white/20
            ${n.type === 'success' ? 'bg-emerald-500 text-white' : n.type === 'error' ? 'bg-red-500 text-white' : 'bg-charcoal text-white'}`}>
            <span className="text-xl">{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}</span>
            <span className="font-bold">{n.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
