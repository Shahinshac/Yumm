"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import { MenuManager } from "@/components/MenuManager";
import { MenuItemForm } from "@/components/MenuItemForm";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
}

export default function RestaurantMenuPage() {
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
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

    loadMenuItems();
  }, [isAuthenticated, user?.role, router]);

  const loadMenuItems = async () => {
    setLoading(true);
    const result = await apiCall<{ data: MenuItem[] }>(
      "/restaurant/menu",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (result.success && result.data) {
      setItems((result.data as any).data || []);
    }
    setLoading(false);
  };

  const handleAddItem = async (data: any) => {
    const result = await apiCall("/restaurant/menu", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (result.success) {
      setShowForm(false);
      loadMenuItems();
    } else {
      setError(result.error || "Failed to add item");
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!selectedItem) return;

    const result = await apiCall(`/restaurant/menu/${selectedItem.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (result.success) {
      setShowForm(false);
      setSelectedItem(null);
      loadMenuItems();
    } else {
      setError(result.error || "Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const result = await apiCall(`/restaurant/menu/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success) {
      loadMenuItems();
    } else {
      setError(result.error || "Failed to delete item");
    }
  };

  if (!isAuthenticated || user?.role !== "RESTAURANT") {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm - Menu</h1>
          <Link href="/restaurant/dashboard" className="btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Manage Menu</h2>

        {error && (
          <div className="bg-danger/10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Form */}
          <div className="lg:col-span-1">
            {showForm && (
              <MenuItemForm
                item={selectedItem || undefined}
                onSubmit={selectedItem ? handleUpdateItem : handleAddItem}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedItem(null);
                }}
              />
            )}
          </div>

          {/* Menu List */}
          <div className="lg:col-span-2">
            {loading ? (
              <p className="text-gray-500">Loading menu items...</p>
            ) : (
              <MenuManager
                items={items}
                onAdd={() => {
                  setSelectedItem(null);
                  setShowForm(true);
                }}
                onEdit={(item) => {
                  setSelectedItem(item);
                  setShowForm(true);
                }}
                onDelete={handleDeleteItem}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
