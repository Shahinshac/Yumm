import React, { createContext, useState, useContext, ReactNode } from 'react';

export type MenuItem = {
  id: string; name: string; description: string; price: number;
  imageUrl: string; category: string; isVeg?: boolean;
};
export type Restaurant = {
  id: string; name: string; cuisine: string; tags: string;
  rating: number; reviewCount: number; deliveryTime: string;
  deliveryFee: string; imageUrl: string; menu: MenuItem[];
  promo?: string;
};
export type CartItem = { menuItem: MenuItem; quantity: number; };
export type OrderStatus = 'pending'|'accepted'|'preparing'|'ready'|'delivering'|'delivered';
export type Order = {
  id: string; restaurantId: string; restaurantName: string;
  items: CartItem[]; status: OrderStatus; total: number;
  createdAt: Date; address: string;
};

// ── New: Pending registrations ──────────────────────────────────────────────
export type PendingOwner = {
  id: string;
  name: string; email: string; phone: string;
  restaurantName: string; restaurantLocation: string; restaurantCategory: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
};
export type PendingPartner = {
  id: string;
  name: string; email: string; phone: string;
  vehicleType: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
};

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
  // Auth
  currentUser: { role: string; name: string } | null;
  login: (role: string, name: string) => void;
  logout: () => void;
  // Approvals
  pendingOwners: PendingOwner[];
  pendingPartners: PendingPartner[];
  registerOwner: (data: Omit<PendingOwner, 'id' | 'status' | 'registeredAt'>) => void;
  registerPartner: (data: Omit<PendingPartner, 'id' | 'status' | 'registeredAt'>) => void;
  approveOwner: (id: string) => void;
  rejectOwner: (id: string) => void;
  approvePartner: (id: string) => void;
  rejectPartner: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([]);
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);

  const addToCart = (item: MenuItem) =>
    setCart(prev => {
      const ex = prev.find(c => c.menuItem.id === item.id);
      return ex ? prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
               : [...prev, { menuItem: item, quantity: 1 }];
    });

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
    return order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

  const login = (role: string, name: string) => setCurrentUser({ role, name });
  const logout = () => setCurrentUser(null);

  const registerOwner = (data: Omit<PendingOwner, 'id' | 'status' | 'registeredAt'>) => {
    const entry: PendingOwner = {
      ...data,
      id: `OWN-${Date.now()}`,
      status: 'pending',
      registeredAt: new Date(),
    };
    setPendingOwners(prev => [entry, ...prev]);
  };

  const registerPartner = (data: Omit<PendingPartner, 'id' | 'status' | 'registeredAt'>) => {
    const entry: PendingPartner = {
      ...data,
      id: `DRV-${Date.now()}`,
      status: 'pending',
      registeredAt: new Date(),
    };
    setPendingPartners(prev => [entry, ...prev]);
  };

  const approveOwner = (id: string) =>
    setPendingOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
  const rejectOwner = (id: string) =>
    setPendingOwners(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
  const approvePartner = (id: string) =>
    setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  const rejectPartner = (id: string) =>
    setPendingPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));

  return (
    <AppContext.Provider value={{
      restaurants: RESTAURANTS, cart, orders, addToCart, removeFromCart, clearCart,
      cartTotal, cartCount, placeOrder, updateOrderStatus,
      currentUser, login, logout,
      pendingOwners, pendingPartners,
      registerOwner, registerPartner,
      approveOwner, rejectOwner, approvePartner, rejectPartner,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
