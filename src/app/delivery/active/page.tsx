"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  estimatedDelivery?: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
  };
  user: {
    name: string;
    phone: string;
  };
}

export default function DeliveryActivePage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "DELIVERY") {
      router.push("/dashboard");
      return;
    }

    loadActiveDeliveries();
  }, [isAuthenticated, user?.role, router]);

  const loadActiveDeliveries = async () => {
    setLoading(true);
    setError(null);
    const result = await apiCall<{ data: Order[] }>(
      "/orders?status=OUT_FOR_DELIVERY",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      setOrders((result.data as any).data || []);
    } else {
      setError(result.error || "Failed to load deliveries");
    }
    setLoading(false);
  };

  const handleCompleteDelivery = async (orderId: string) => {
    if (!confirm("Mark this delivery as complete?")) return;

    const result = await apiCall(`/delivery/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success) {
      loadActiveDeliveries();
    } else {
      setError(result.error || "Failed to complete delivery");
    }
  };

  if (!isAuthenticated || user?.role !== "DELIVERY") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Active Deliveries</h1>
          <Link href="/delivery/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Your Active Deliveries</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading deliveries...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
            <p className="text-gray-500 text-lg mb-md">No active deliveries</p>
            <p className="text-sm text-gray-600 mb-lg">You don't have any orders currently out for delivery</p>
            <Link href="/delivery/dashboard">
              <Button variant="primary">← Find Deliveries</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-md">
            {orders.map((order) => {
              const eta = order.estimatedDelivery
                ? Math.max(
                    0,
                    Math.floor(
                      (new Date(order.estimatedDelivery).getTime() - Date.now()) /
                        60000
                    )
                  )
                : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg border border-gray-200 p-lg"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-md pb-md border-b border-gray-200">
                    <div>
                      <p className="font-bold text-lg">
                        Order #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.totalPrice.toFixed(0)}</p>
                      <p className="text-sm text-primary font-semibold">
                        ETA: {eta} min
                      </p>
                    </div>
                  </div>

                  {/* From Restaurant */}
                  <div className="mb-md pb-md border-b border-gray-200">
                    <p className="font-semibold mb-xs">📍 Pickup from:</p>
                    <p className="font-bold text-lg">{order.restaurant.name}</p>
                    <p className="text-sm text-gray-600 mb-xs">{order.restaurant.address}</p>
                    <p className="text-sm text-gray-600">📞 {order.restaurant.phone}</p>
                  </div>

                  {/* To Customer */}
                  <div className="mb-md pb-md border-b border-gray-200">
                    <p className="font-semibold mb-xs">🏠 Deliver to:</p>
                    <p className="font-bold text-lg">{order.user.name}</p>
                    <p className="text-sm text-gray-600">📞 {order.user.phone}</p>
                  </div>

                  {/* Complete Button */}
                  <Button
                    variant="primary"
                    onClick={() => handleCompleteDelivery(order.id)}
                    className="w-full"
                  >
                    ✅ Mark as Delivered
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && (
          <div className="mt-lg">
            <Button variant="outline" onClick={loadActiveDeliveries}>
              🔄 Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
