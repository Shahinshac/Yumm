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

export type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};
