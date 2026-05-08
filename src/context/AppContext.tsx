import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ApiService } from '../services/api';
import type { 
  MenuItem, Restaurant, CartItem, OrderStatus, Order, 
  PendingOwner, PendingPartner, Notification 
} from '../types';

const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1', name: 'The Velvet Bistro', cuisine: 'Modern European',
    tags: 'French Fusion • Fine Dining • Wine Bar',
    rating: 4.9, reviewCount: 842, deliveryTime: '40-55 min',
    deliveryFee: 'Free delivery', promo: '20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop',
    menu: [
      { id: 'm1', name: 'Truffle Atlantic Salmon', description: 'Pan-seared Atlantic salmon with black truffle cream, seasonal vegetables and saffron risotto.', price: 28.50, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop', category: 'Mains', isVeg: false },
      { id: 'm2', name: 'Signature Angus Burger', description: 'Hand-pressed 200g Angus patty with truffle aioli, aged cheddar, and brioche bun.', price: 14.50, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop', category: 'Mains', isVeg: false },
      { id: 'm3', name: 'Quinoa Buddha Bowl', description: 'Tri-color quinoa, roasted vegetables, tahini, pomegranate and micro herbs.', price: 12.00, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop', category: 'Mains', isVeg: true },
      { id: 'm4', name: 'Molten Lava Cake', description: 'Warm Valrhona chocolate fondant with vanilla bean ice cream and gold leaf.', price: 12.00, imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop', category: 'Desserts', isVeg: true },
    ],
  },
  {
    id: 'r2', name: 'Zen Garden Sushi', cuisine: 'Japanese',
    tags: 'Premium Seafood • Omakase • Sake Bar',
    rating: 4.8, reviewCount: 621, deliveryTime: '35-45 min',
    deliveryFee: '$2.99 delivery', promo: '50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop',
    menu: [
      { id: 'm5', name: 'Wagyu Nigiri Set', description: 'Six-piece premium A5 Wagyu nigiri with house soy and wasabi.', price: 48.00, imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?q=80&w=800&auto=format&fit=crop', category: 'Sushi', isVeg: false },
      { id: 'm6', name: 'Dragon Roll', description: 'Shrimp tempura, cucumber, avocado, topped with tobiko and eel sauce.', price: 22.00, imageUrl: 'https://images.unsplash.com/photo-1617196034296-1f527b965b30?q=80&w=800&auto=format&fit=crop', category: 'Rolls', isVeg: false },
    ],
  },
  {
    id: 'r3', name: "L'Or Brasserie", cuisine: 'French',
    tags: 'Brasserie • Champagne • Oyster Bar',
    rating: 4.7, reviewCount: 389, deliveryTime: '50-65 min',
    deliveryFee: 'Free delivery',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop',
    menu: [
      { id: 'm7', name: 'Duck Confit', description: 'Slow-cooked Moulard duck leg, Puy lentils, roasted shallots and jus.', price: 34.00, imageUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f928f1e?q=80&w=800&auto=format&fit=crop', category: 'Mains', isVeg: false },
      { id: 'm8', name: 'Crème Brûlée', description: 'Classic Madagascar vanilla custard with caramelized sugar crust.', price: 10.00, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?q=80&w=800&auto=format&fit=crop', category: 'Desserts', isVeg: true },
    ],
  },
];

interface AppContextType {
  restaurants: Restaurant[]; cart: CartItem[];
  orders: Order[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number; cartCount: number;
  placeOrder: (restaurantId: string, address: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentUser: { role: string; name: string; email?: string } | null;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Load from localStorage
  const load = (key: string, def: any) => {
    const saved = localStorage.getItem(key);
    if (!saved) return def;
    try {
      const parsed = JSON.parse(saved);
      // Revive dates
      if (key === 'orders') return parsed.map((o: any) => ({ ...o, createdAt: new Date(o.createdAt) }));
      if (key === 'pendingOwners' || key === 'pendingPartners') return parsed.map((o: any) => ({ ...o, registeredAt: new Date(o.registeredAt) }));
      return parsed;
    } catch { return def; }
  };

  const [cart, setCart] = useState<CartItem[]>(() => load('cart', []));
  const [orders, setOrders] = useState<Order[]>(() => load('orders', []));
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string; email?: string } | null>(() => load('user', null));
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>(() => load('pendingOwners', []));
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>(() => load('pendingPartners', []));
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Persistence
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

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem.id === item.id);
      return ex ? prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
               : [...prev, { menuItem: item, quantity: 1 }];
    });
    showNotification(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) =>
    setCart(prev => prev.filter(c => c.menuItem.id !== itemId));

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((s, i) => s + i.menuItem.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = (restaurantId: string, address: string) => {
    const r = RESTAURANTS.find(r => r.id === restaurantId)!;
    const order: Order = {
      id: `ORD-${Math.floor(Math.random()*9000)+1000}`,
      restaurantId, restaurantName: r.name,
      items: [...cart], status: 'pending',
      total: cartTotal + 4.99 + 2.50,
      createdAt: new Date(), address,
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
    // High-level Security: Verify approval for privileged roles
    if (role === 'owner') {
      const approval = pendingOwners.find(o => o.email === email || o.name === name);
      if (!approval || approval.status !== 'approved') {
        showNotification('Security Access Denied: Merchant account pending admin approval.', 'error');
        return false;
      }
    }
    if (role === 'partner') {
      const approval = pendingPartners.find(p => p.email === email || p.name === name);
      if (!approval || approval.status !== 'approved') {
        showNotification('Security Access Denied: Logistics account pending admin approval.', 'error');
        return false;
      }
    }

    setCurrentUser({ role, name, email });
    showNotification(`Logged in as ${name}`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    showNotification('Securely logged out', 'info');
  };

  const registerOwner = async (data: Omit<PendingOwner, 'id' | 'status' | 'registeredAt'>) => {
    const entry: PendingOwner = {
      ...data,
      id: `OWN-${Date.now()}`,
      status: 'pending',
      registeredAt: new Date(),
    };
    await ApiService.submitOwnerApplication(entry);
    setPendingOwners(prev => [entry, ...prev]);
    showNotification('Registration submitted for review');
  };

  const registerPartner = (data: Omit<PendingPartner, 'id' | 'status' | 'registeredAt'>) => {
    const entry: PendingPartner = {
      ...data,
      id: `DRV-${Date.now()}`,
      status: 'pending',
      registeredAt: new Date(),
    };
    setPendingPartners(prev => [entry, ...prev]);
    showNotification('Application submitted for review');
  };

  const approveOwner = (id: string) => {
    setPendingOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
    showNotification('Owner approved');
  };
  const rejectOwner = (id: string) => {
    setPendingOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
    showNotification('Owner application rejected', 'error');
  };
  const approvePartner = (id: string) => {
    setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    showNotification('Partner approved');
  };
  const rejectPartner = (id: string) => {
    setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    showNotification('Partner application rejected', 'error');
  };

  const isApproved = (role: string, email?: string, name?: string) => {
    if (role === 'customer' || role === 'admin') return true;
    if (role === 'owner') {
      const approval = pendingOwners.find(o => o.email === email || o.name === name);
      return approval?.status === 'approved';
    }
    if (role === 'partner') {
      const approval = pendingPartners.find(p => p.email === email || p.name === name);
      return approval?.status === 'approved';
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      restaurants: RESTAURANTS, cart, orders, addToCart, removeFromCart, clearCart,
      cartTotal, cartCount, placeOrder, updateOrderStatus,
      currentUser, login, logout,
      pendingOwners, pendingPartners,
      registerOwner, registerPartner,
      approveOwner, rejectOwner, approvePartner, rejectPartner,
      notifications, showNotification,
      isApproved,
    }}>
      {children}
      {/* Global Notification UI */}
      <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border border-white/20
            ${n.type === 'success' ? 'bg-emerald-500 text-white' : n.type === 'error' ? 'bg-red-500 text-white' : 'bg-charcoal text-white'}`}>
            <span className="text-xl">
              {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}
            </span>
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

