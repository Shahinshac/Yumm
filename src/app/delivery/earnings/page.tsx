"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { EarningsStats } from "@/components/EarningsStats";
import { DeliveryHistory } from "@/components/DeliveryHistory";

interface Delivery {
  id: string;
  deliveryFee: number;
  createdAt: string;
}

interface EarningsData {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  completedDeliveries: number;
  activeDeliveries: number;
  averageEarningsPerDelivery: number;
  recentDeliveries: Delivery[];
}

export default function DeliveryEarningsPage() {
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
        <p className="text-gray-500">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Earnings</h1>
          <Link href="/delivery/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Your Earnings</h2>

        {/* Stats */}
        {earnings && (
          <div className="mb-xl">
            <EarningsStats {...earnings} />
          </div>
        )}

        {/* Recent History */}
        <div className="mb-xl">
          <h3 className="text-xl font-bold mb-lg">Recent Deliveries</h3>
          {earnings && (
            <DeliveryHistory deliveries={earnings.recentDeliveries || []} />
          )}
        </div>

        {/* Refresh Button */}
        <Button variant="outline" onClick={loadEarnings}>
          🔄 Refresh Earnings
        </Button>
      </div>
    </div>
  );
}
