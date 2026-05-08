export type PortionLabel = '1/4' | '1/2' | '3/4' | 'FULL';

export type Portion = {
  label: PortionLabel;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // Base price (Full)
  imageUrl: string;
  category: string;
  isVeg?: boolean;
  hasPortions?: boolean;
  portions?: Portion[];
};

export type Restaurant = {
  id: string;
  ownerId?: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  imageUrl: string;
  menu: MenuItem[];
  status: 'active' | 'pending' | 'suspended';
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  selectedPortion?: Portion;
};

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up' | 'delivered';

export type Order = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  address: string;
  customerName?: string;
  customerPhone?: string;
};

export type PendingOwner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  cuisineType: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
};

export type PendingPartner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
};

export type Notification = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};
