// Type definitions for the API
export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "RESTAURANT" | "DELIVERY" | "ADMIN";
  avatar?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating: number;
  address: string;
  phone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  totalPrice: number;
  deliveryFee: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
