"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { OrderStatus } from "@/components/OrderStatus";
import { ETA } from "@/components/ETA";
import { DeliveryMap } from "@/components/DeliveryMap";

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  estimatedDelivery?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  deliveryPartner?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  notes?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId, isAuthenticated, router]);

  const loadOrder = async () => {
    setLoading(true);
    const result = await apiCall<OrderDetail>(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setOrder(result.data);
    } else {
      setError(result.error || "Failed to load order");
    }
    setLoading(false);
  };

  // Polling for status updates every 30 seconds
  useEffect(() => {
    if (!order || !orderId) return;

    const interval = setInterval(() => {
      loadOrder();
    }, 30000);

    return () => clearInterval(interval);
  }, [orderId, order?.id]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-md">{error || "Order not found"}</p>
          <Button onClick={() => router.back()}>← Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
          <Link href="/dashboard" className="btn-outline">
            ← Back to Orders
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <div className="mb-lg">
          <h2 className="text-3xl font-bold mb-md">Order #{order.id.slice(-8)}</h2>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Status Timeline */}
            <OrderStatus
              status={order.status}
              createdAt={order.createdAt}
              estimatedDelivery={order.estimatedDelivery}
            />

            {/* Delivery Map */}
            <DeliveryMap
              deliveryPartner={order.deliveryPartner}
              status={order.status}
            />

            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg">
              <h3 className="text-lg font-bold mb-lg">Order Items</h3>
              <div className="space-y-md">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-md border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-md flex-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mt-lg pt-lg border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-md">Special Instructions</p>
                  <p className="text-gray-800">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* ETA */}
            <ETA
              estimatedDelivery={order.estimatedDelivery}
              status={order.status}
            />

            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg">
              <h3 className="text-lg font-bold mb-lg">Order Summary</h3>
              <div className="space-y-md text-sm mb-lg pb-lg border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    ₹{Math.round(order.total * 0.9).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold">₹50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">
                    ₹{Math.round(order.total * 0.05).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{order.total.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`rounded-lg p-lg text-center font-semibold ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {order.status.replace(/_/g, " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
