"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { RestaurantOrderList } from "@/components/RestaurantOrderList";

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

export default function RestaurantOrdersPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "RESTAURANT") {
      router.push("/dashboard");
      return;
    }

    loadOrders();
  }, [isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const result = await apiCall<{ data: Order[] }>("/restaurant/orders", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setOrders((result.data as any).data || []);
    } else {
      setError(result.error || "Failed to load orders");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const result = await apiCall(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (result.success) {
      loadOrders();
    } else {
      setError(result.error || "Failed to update order status");
    }
  };

  if (!isAuthenticated || user?.role !== "RESTAURANT") {
    return null;
  }

  const statusCounts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    PREPARING: orders.filter((o) => o.status === "PREPARING").length,
    READY: orders.filter((o) => o.status === "READY").length,
    OUT_FOR_DELIVERY: orders.filter((o) => o.status === "OUT_FOR_DELIVERY")
      .length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Orders</h1>
          <Link href="/restaurant/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Manage Orders</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-lg flex gap-md flex-wrap">
          <Button
            variant={statusFilter === "all" ? "primary" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            All ({orders.length})
          </Button>
          <Button
            variant={statusFilter === "PENDING" ? "primary" : "outline"}
            onClick={() => setStatusFilter("PENDING")}
          >
            📋 Pending ({statusCounts.PENDING})
          </Button>
          <Button
            variant={statusFilter === "CONFIRMED" ? "primary" : "outline"}
            onClick={() => setStatusFilter("CONFIRMED")}
          >
            ✓ Confirmed ({statusCounts.CONFIRMED})
          </Button>
          <Button
            variant={statusFilter === "PREPARING" ? "primary" : "outline"}
            onClick={() => setStatusFilter("PREPARING")}
          >
            👨‍🍳 Preparing ({statusCounts.PREPARING})
          </Button>
          <Button
            variant={statusFilter === "READY" ? "primary" : "outline"}
            onClick={() => setStatusFilter("READY")}
          >
            📦 Ready ({statusCounts.READY})
          </Button>
          <Button
            variant={statusFilter === "OUT_FOR_DELIVERY" ? "primary" : "outline"}
            onClick={() => setStatusFilter("OUT_FOR_DELIVERY")}
          >
            🚴 Out for Delivery ({statusCounts.OUT_FOR_DELIVERY})
          </Button>
          <Button
            variant={statusFilter === "DELIVERED" ? "primary" : "outline"}
            onClick={() => setStatusFilter("DELIVERED")}
          >
            ✅ Delivered ({statusCounts.DELIVERED})
          </Button>
        </div>

        {/* Orders */}
        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : (
          <RestaurantOrderList
            orders={filteredOrders}
            onStatusUpdate={handleStatusUpdate}
            loading={loading}
          />
        )}

        {/* Refresh Button */}
        <div className="mt-lg">
          <Button variant="outline" onClick={loadOrders}>
            🔄 Refresh Orders
          </Button>
        </div>
      </div>
    </div>
  );
}
