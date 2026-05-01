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
  restaurant: { name: string };
  user: { name: string; email: string };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadOrders();
  }, [isAuthenticated, user?.role, router]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const url = statusFilter === "all" ? "/admin/orders" : `/admin/orders?status=${statusFilter}`;
    const result = await apiCall<{ data: Order[] }>(url, {
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

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PREPARING", label: "Preparing" },
    { value: "READY", label: "Ready" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Order Monitoring</h1>
          <Link href="/admin/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Monitor Orders</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="mb-lg">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              loadOrders();
            }}
            className="input"
          >
            <option value="all">All Orders ({orders.length})</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-lg py-md text-left text-sm font-semibold">Order ID</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Customer</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Restaurant</th>
                  <th className="px-lg py-md text-right text-sm font-semibold">Amount</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Status</th>
                  <th className="px-lg py-md text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-lg py-md font-mono text-sm">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="px-lg py-md">
                      <div>
                        <p className="font-semibold text-sm">{order.user.name}</p>
                        <p className="text-xs text-gray-600">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="px-lg py-md text-sm">{order.restaurant.name}</td>
                    <td className="px-lg py-md text-right font-semibold">
                      ₹{order.totalPrice.toFixed(0)}
                    </td>
                    <td className="px-lg py-md">
                      <span
                        className={`badge text-xs ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-lg py-md text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refresh */}
        {!loading && (
          <div className="mt-lg">
            <Button variant="outline" onClick={() => loadOrders()}>
              🔄 Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
