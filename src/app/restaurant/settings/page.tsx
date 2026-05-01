"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export default function RestaurantSettingsPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "RESTAURANT") {
      router.push("/dashboard");
      return;
    }

    loadRestaurant();
  }, [isAuthenticated, user?.role, router]);

  const loadRestaurant = async () => {
    setLoading(true);
    // For now, we'll show a placeholder as we don't have a dedicated restaurant detail endpoint
    // In a real app, you'd fetch the restaurant data here
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // This would be implemented with a PATCH endpoint to update restaurant
    setSuccess("Restaurant settings updated successfully");
    setEditing(false);
  };

  if (!isAuthenticated || user?.role !== "RESTAURANT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Settings</h1>
          <Link href="/restaurant/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Restaurant Settings</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-md py-sm rounded-md mb-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Restaurant Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-lg">
            <h3 className="text-lg font-bold mb-lg">Restaurant Information</h3>

            <div className="space-y-md">
              <div>
                <label className="block font-semibold mb-xs">Name</label>
                <p className="text-gray-700 text-lg">{user?.name || "Your Restaurant"}</p>
              </div>

              <div>
                <label className="block font-semibold mb-xs">Email</label>
                <p className="text-gray-700">{user?.email || "contact@restaurant.com"}</p>
              </div>

              <div>
                <label className="block font-semibold mb-xs">Account Status</label>
                <p className="text-green-700 font-semibold">✓ Active</p>
              </div>
            </div>

            {!editing && (
              <Button
                variant="primary"
                onClick={() => setEditing(true)}
                className="w-full mt-lg"
              >
                Edit Information
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-lg">
            <h3 className="text-lg font-bold mb-lg">Account Summary</h3>

            <div className="space-y-md">
              <div className="flex justify-between items-center pb-md border-b border-gray-200">
                <span className="text-gray-600">Account Type</span>
                <span className="font-semibold">🏪 Restaurant</span>
              </div>

              <div className="flex justify-between items-center pb-md border-b border-gray-200">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold">2026</span>
              </div>

              <div className="flex justify-between items-center pb-md border-b border-gray-200">
                <span className="text-gray-600">Verification</span>
                <span className="font-semibold text-green-600">✓ Verified</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Support</span>
                <span className="font-semibold text-blue-600">Contact Us</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-xl bg-red-50 border border-red-200 rounded-lg p-lg">
          <h3 className="text-lg font-bold text-red-700 mb-md">Danger Zone</h3>
          <p className="text-red-600 mb-lg">
            These actions are irreversible. Please proceed with caution.
          </p>
          <Button variant="outline" className="text-red-600">
            Deactivate Restaurant
          </Button>
        </div>
      </div>
    </div>
  );
}
