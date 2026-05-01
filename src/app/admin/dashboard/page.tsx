"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { AdminStats } from "@/components/AdminStats";

interface Stats {
  totalUsers: number;
  customerCount: number;
  restaurantCount: number;
  deliveryCount: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  avgRating: number;
  totalReviews: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadStats();
  }, [isAuthenticated, user?.role, router]);

  const loadStats = async () => {
    setLoading(true);
    const result = await apiCall<{ data: Stats }>("/admin/stats", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setStats((result.data as any).data);
    }
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Admin</h1>
          <div className="flex gap-md">
            <Link href="/admin/users" className="btn-outline">
              👥 Users
            </Link>
            <Link href="/admin/orders" className="btn-outline">
              📦 Orders
            </Link>
            <Link href="/admin/analytics" className="btn-outline">
              📊 Analytics
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Admin Dashboard</h2>

        {/* Stats */}
        {stats && (
          <div className="mb-xl">
            <AdminStats {...stats} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <Link href="/admin/users" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">👥</p>
              <h3 className="font-bold mb-md">Manage Users</h3>
              <p className="text-sm text-gray-600">
                View and manage all users on the platform
              </p>
            </div>
          </Link>

          <Link href="/admin/orders" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">📦</p>
              <h3 className="font-bold mb-md">Monitor Orders</h3>
              <p className="text-sm text-gray-600">
                Track all orders and their status
              </p>
            </div>
          </Link>

          <Link href="/admin/analytics" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">📊</p>
              <h3 className="font-bold mb-md">View Analytics</h3>
              <p className="text-sm text-gray-600">
                Detailed platform analytics and insights
              </p>
            </div>
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-lg">
          <h3 className="text-xl font-bold mb-md">Welcome to Admin Dashboard</h3>
          <p className="text-gray-600 mb-md">
            You have full administrative access to the Yumm platform. Use the navigation above to manage users, monitor orders, and view detailed analytics about platform performance.
          </p>
          <Button variant="primary" onClick={loadStats}>
            🔄 Refresh Stats
          </Button>
        </div>
      </div>
    </div>
  );
}
