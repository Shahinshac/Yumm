"use client";

import { Button } from "./Button";

interface MenuItem {
  name: string;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

interface Restaurant {
  name: string;
  address: string;
  phone: string;
}

interface User {
  name: string;
  phone: string;
}

interface Order {
  id: string;
  totalPrice: number;
  createdAt: string;
  restaurant: Restaurant;
  user: User;
  items: OrderItem[];
}

interface AvailableOrderListProps {
  orders: Order[];
  onAccept: (orderId: string) => void;
  loading?: boolean;
}

export function AvailableOrderList({
  orders,
  onAccept,
  loading = false,
}: AvailableOrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
        <p className="text-gray-500 text-lg mb-md">No available deliveries</p>
        <p className="text-sm text-gray-600">Check back soon for new orders!</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-md pb-md border-b border-gray-200">
            <div>
              <p className="font-bold text-lg">
                Order #{order.id.slice(-8)}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <p className="font-bold text-lg text-primary">
              ₹{order.totalPrice.toFixed(0)}
            </p>
          </div>

          {/* Restaurant Info */}
          <div className="mb-md pb-md border-b border-gray-200">
            <p className="font-semibold mb-xs">🏪 From: {order.restaurant.name}</p>
            <p className="text-sm text-gray-600 mb-xs">
              📍 {order.restaurant.address}
            </p>
            <p className="text-sm text-gray-600">📞 {order.restaurant.phone}</p>
          </div>

          {/* Customer Info */}
          <div className="mb-md pb-md border-b border-gray-200">
            <p className="font-semibold mb-xs">👤 To: {order.user.name}</p>
            <p className="text-sm text-gray-600">📞 {order.user.phone}</p>
          </div>

          {/* Items */}
          <div className="mb-md pb-md border-b border-gray-200">
            <p className="font-semibold mb-xs">Items ({order.items.length})</p>
            <div className="space-y-xs">
              {order.items.map((item, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  • {item.quantity}x {item.menuItem.name}
                </p>
              ))}
            </div>
          </div>

          {/* Accept Button */}
          <Button
            variant="primary"
            onClick={() => onAccept(order.id)}
            disabled={loading}
            className="w-full"
          >
            🚴 Accept Delivery
          </Button>
        </div>
      ))}
    </div>
  );
}
