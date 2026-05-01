"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";

interface Analytics {
  statusDistribution: Record<string, number>;
  restaurantRevenue: Array<{ restaurantName: string; revenue: number; orders: number }>;
  newUsers: number;
  restaurantStats: Array<{ name: string; avgOrderValue: number; orderCount: number }>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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

    loadAnalytics();
  }, [isAuthenticated, user?.role, router]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    const result = await apiCall<{ data: Analytics }>("/admin/analytics", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setAnalytics((result.data as any).data);
    } else {
      setError(result.error || "Failed to load analytics");
    }
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Platform Analytics</h1>
          <Link href="/admin/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Platform Analytics</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading analytics...</p>
        ) : analytics ? (
          <>
            {/* Status Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg mb-xl">
              <h3 className="text-lg font-bold mb-lg">Order Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                  <div key={status} className="text-center p-md border border-gray-200 rounded">
                    <p className="text-2xl font-bold text-primary">{count}</p>
                    <p className="text-sm text-gray-600">{status.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* New Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg mb-xl">
              <h3 className="text-lg font-bold">New Users (Last 7 Days)</h3>
              <p className="text-3xl font-bold text-primary mt-md">{analytics.newUsers} users</p>
            </div>

            {/* Top Restaurants by Revenue */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg mb-xl">
              <h3 className="text-lg font-bold mb-lg">Top Restaurants by Revenue</h3>
              <div className="space-y-md">
                {analytics.restaurantRevenue.slice(0, 5).map((restaurant, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-md border-b last:border-0">
                    <div>
                      <p className="font-semibold">{restaurant.restaurantName}</p>
                      <p className="text-sm text-gray-600">{restaurant.orders} orders</p>
                    </div>
                    <p className="font-bold text-lg">₹{restaurant.revenue.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurant Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-lg">
              <h3 className="text-lg font-bold mb-lg">Restaurant Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-md py-md text-left font-semibold">Restaurant</th>
                      <th className="px-md py-md text-right font-semibold">Avg Order Value</th>
                      <th className="px-md py-md text-right font-semibold">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.restaurantStats.map((restaurant, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-md py-md">{restaurant.name}</td>
                        <td className="px-md py-md text-right">
                          ₹{restaurant.avgOrderValue.toFixed(0)}
                        </td>
                        <td className="px-md py-md text-right font-semibold">
                          {restaurant.orderCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refresh */}
            <div className="mt-lg">
              <Button variant="outline" onClick={() => loadAnalytics()}>
                🔄 Refresh Analytics
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
