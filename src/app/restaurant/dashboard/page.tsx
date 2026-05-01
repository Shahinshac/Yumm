"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { RestaurantStats } from "@/components/RestaurantStats";

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  avgRating: number;
  menuItemsCount: number;
  reviewsCount: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function RestaurantDashboard() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "RESTAURANT") {
      router.push("/dashboard");
      return;
    }

    loadAnalytics();
  }, [isAuthenticated, user?.role, router]);

  const loadAnalytics = async () => {
    setLoading(true);
    const result = await apiCall<{ data: Analytics }>(
      "/restaurant/analytics",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      setAnalytics((result.data as any).data);
    }
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== "RESTAURANT") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Restaurant</h1>
          <div className="flex gap-md">
            <Link href="/restaurant/menu" className="btn-outline">
              📋 Menu
            </Link>
            <Link href="/restaurant/orders" className="btn-outline">
              📦 Orders
            </Link>
            <Link href="/restaurant/settings" className="btn-outline">
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Dashboard</h2>

        {/* Stats */}
        {analytics && (
          <div className="mb-xl">
            <RestaurantStats {...analytics} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <Link href="/restaurant/menu" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">📋</p>
              <h3 className="font-bold mb-md">Manage Menu</h3>
              <p className="text-sm text-gray-600">
                Add, edit, or remove menu items
              </p>
            </div>
          </Link>

          <Link href="/restaurant/orders" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">📦</p>
              <h3 className="font-bold mb-md">View Orders</h3>
              <p className="text-sm text-gray-600">
                Manage incoming and completed orders
              </p>
            </div>
          </Link>

          <Link href="/restaurant/settings" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">⚙️</p>
              <h3 className="font-bold mb-md">Settings</h3>
              <p className="text-sm text-gray-600">
                Update restaurant details and info
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-lg">
          <h3 className="text-xl font-bold mb-md">Welcome to Your Dashboard!</h3>
          <p className="text-gray-600">
            Use the menu above to manage your menu items, track orders, and update your restaurant settings.
            The statistics above show your performance metrics including total orders, revenue, and ratings.
          </p>
          <div className="mt-md">
            <Button variant="primary" onClick={loadAnalytics}>
              🔄 Refresh Stats
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
