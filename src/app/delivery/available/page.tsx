"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AvailableOrderList } from "@/components/AvailableOrderList";

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

export default function DeliveryAvailablePage() {
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

    loadAvailableOrders();
  }, [isAuthenticated, user?.role, router]);

  const loadAvailableOrders = async () => {
    setLoading(true);
    setError(null);
    const result = await apiCall<{ data: Order[] }>(
      "/delivery/orders",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      setOrders((result.data as any).data || []);
    } else {
      setError(result.error || "Failed to load orders");
    }
    setLoading(false);
  };

  const handleAcceptDelivery = async (orderId: string) => {
    const result = await apiCall(`/delivery/orders/${orderId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success) {
      // Navigate to active deliveries
      router.push("/delivery/active");
    } else {
      setError(result.error || "Failed to accept delivery");
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
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Find Deliveries</h1>
          <div className="flex gap-md">
            <Link href="/delivery/active" className="btn-outline">
              🚴 Active
            </Link>
            <Link href="/delivery/dashboard" className="btn-outline">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Available Deliveries</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading available deliveries...</p>
        ) : (
          <AvailableOrderList
            orders={orders}
            onAccept={handleAcceptDelivery}
            loading={loading}
          />
        )}

        {/* Refresh Button */}
        {!loading && (
          <div className="mt-lg">
            <Button variant="outline" onClick={loadAvailableOrders}>
              🔄 Refresh Available Orders
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
