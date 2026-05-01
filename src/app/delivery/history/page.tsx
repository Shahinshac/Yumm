"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { DeliveryHistory } from "@/components/DeliveryHistory";

interface Delivery {
  id: string;
  deliveryFee: number;
  createdAt: string;
}

export default function DeliveryHistoryPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
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

    loadHistory();
  }, [isAuthenticated, user?.role, router]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    const result = await apiCall<{ data: Delivery[] }>(
      "/orders?status=DELIVERED",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      const data = (result.data as any).data || [];
      setDeliveries(
        data.map((order: any) => ({
          id: order.id,
          deliveryFee: order.deliveryFee,
          createdAt: order.createdAt,
        }))
      );
    } else {
      setError(result.error || "Failed to load history");
    }
    setLoading(false);
  };

  if (!isAuthenticated || user?.role !== "DELIVERY") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Delivery History</h1>
          <Link href="/delivery/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Completed Deliveries</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading delivery history...</p>
        ) : (
          <>
            <DeliveryHistory deliveries={deliveries} />
            <div className="mt-lg text-sm text-gray-600">
              Total completed deliveries: {deliveries.length}
            </div>
          </>
        )}

        {/* Refresh Button */}
        {!loading && (
          <div className="mt-lg">
            <Button variant="outline" onClick={loadHistory}>
              🔄 Refresh History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
