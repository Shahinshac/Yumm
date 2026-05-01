"use client";

import { Button } from "./Button";

interface OrderItem {
  menuItem: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
}

interface RestaurantOrderListProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, status: string) => void;
  loading?: boolean;
}

const statusOptions = [
  { value: "PENDING", label: "Pending", icon: "📋" },
  { value: "CONFIRMED", label: "Confirmed", icon: "✓" },
  { value: "PREPARING", label: "Preparing", icon: "👨‍🍳" },
  { value: "READY", label: "Ready", icon: "📦" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🚴" },
  { value: "DELIVERED", label: "Delivered", icon: "✅" },
  { value: "CANCELLED", label: "Cancelled", icon: "❌" },
];

export function RestaurantOrderList({
  orders,
  onStatusUpdate,
  loading = false,
}: RestaurantOrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg border border-gray-200 p-lg"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-md pb-md border-b border-gray-200">
            <div>
              <p className="font-semibold">Order #{order.id.slice(-8)}</p>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">₹{order.totalPrice.toFixed(0)}</p>
              <p className="text-sm text-gray-600">
                {order.user.name} • {order.user.phone}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-md pb-md border-b border-gray-200 space-y-sm">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menuItem.name}
                </span>
                <span className="text-gray-600">
                  ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Status Update */}
          <div className="flex items-center gap-md">
            <span className="text-sm font-semibold">Status:</span>
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              disabled={loading || order.status === "DELIVERED" || order.status === "CANCELLED"}
              className="input text-sm flex-1"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
