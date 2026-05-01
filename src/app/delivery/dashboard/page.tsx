"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { EarningsStats } from "@/components/EarningsStats";

interface EarningsData {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  completedDeliveries: number;
  activeDeliveries: number;
  averageEarningsPerDelivery: number;
}

export default function DeliveryDashboard() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "DELIVERY") {
      router.push("/dashboard");
      return;
    }

    loadEarnings();
  }, [isAuthenticated, user?.role, router]);

  const loadEarnings = async () => {
    setLoading(true);
    const result = await apiCall<{ data: EarningsData }>(
      "/delivery/earnings",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      setEarnings((result.data as any).data);
    }
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== "DELIVERY") {
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
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Delivery</h1>
          <div className="flex gap-md">
            <Link href="/delivery/active" className="btn-outline">
              🚴 Active
            </Link>
            <Link href="/delivery/history" className="btn-outline">
              📋 History
            </Link>
            <Link href="/delivery/earnings" className="btn-outline">
              💰 Earnings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Dashboard</h2>

        {/* Stats */}
        {earnings && (
          <div className="mb-xl">
            <EarningsStats {...earnings} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          <Link href="/delivery/active" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">🚴</p>
              <h3 className="font-bold mb-md">Active Deliveries</h3>
              <p className="text-sm text-gray-600">
                {earnings?.activeDeliveries || 0} order{(earnings?.activeDeliveries || 0) !== 1 ? "s" : ""} in progress
              </p>
            </div>
          </Link>

          <Link href="/delivery/dashboard" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">📦</p>
              <h3 className="font-bold mb-md">Find Deliveries</h3>
              <p className="text-sm text-gray-600">
                Browse available orders to accept
              </p>
            </div>
          </Link>

          <Link href="/delivery/earnings" className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-lg hover:shadow-md transition cursor-pointer">
              <p className="text-3xl mb-md">💰</p>
              <h3 className="font-bold mb-md">Earnings</h3>
              <p className="text-sm text-gray-600">
                ₹{earnings?.totalEarnings.toFixed(0) || "0"} total earned
              </p>
            </div>
          </Link>
        </div>

        {/* Welcome */}
        <div className="bg-white rounded-lg border border-gray-200 p-lg">
          <h3 className="text-xl font-bold mb-md">Welcome, Delivery Partner! 🚴</h3>
          <p className="text-gray-600 mb-md">
            You're all set to start earning! Browse available orders and accept deliveries to start making money.
          </p>
          <div className="flex gap-md">
            <Button variant="primary" onClick={loadEarnings}>
              🔄 Refresh Stats
            </Button>
            <Link href="/delivery/active">
              <Button variant="outline">View Active Deliveries</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
