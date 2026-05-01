"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import { MenuItemCard } from "@/components/MenuItemCard";
import { Button } from "@/components/Button";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating: number;
  address: string;
  phone: string;
  menus: MenuItem[];
  menuCount: number;
  totalReviews: number;
  totalOrders: number;
  averageRating: number;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupedMenus, setGroupedMenus] = useState<Map<string, MenuItem[]>>(
    new Map()
  );

  const restaurantId = params.id as string;

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    setLoading(true);
    const result = await apiCall<Restaurant>(`/restaurants/${restaurantId}`);
    if (result.success && result.data) {
      setRestaurant(result.data);

      // Group menu items by category
      const grouped = new Map<string, MenuItem[]>();
      (result.data.menus || []).forEach((item) => {
        const category = item.category || "Others";
        if (!grouped.has(category)) {
          grouped.set(category, []);
        }
        grouped.get(category)!.push(item);
      });
      setGroupedMenus(grouped);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-md">Restaurant not found</p>
          <Button onClick={() => router.back()}>← Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-md py-lg">
          <div className="flex flex-col md:flex-row gap-lg mb-lg">
            {/* Image */}
            <div className="relative w-full md:w-64 h-64 rounded-lg overflow-hidden flex-shrink-0">
              {restaurant.image ? (
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl bg-gradient-to-br from-primary/10 to-secondary/10">
                  🏪
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-md">{restaurant.name}</h1>

              {restaurant.description && (
                <p className="text-gray-600 text-lg mb-md">
                  {restaurant.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-md mb-md">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary">
                    ⭐ {restaurant.averageRating.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">
                    ({restaurant.totalReviews} reviews)
                  </p>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary">
                    🍽️ {restaurant.menuCount}
                  </div>
                  <p className="text-sm text-gray-600">Items</p>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-primary">
                    📦 {restaurant.totalOrders}
                  </div>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-lg text-sm text-gray-600">
                <span>📍 {restaurant.address}</span>
                <span>📞 {restaurant.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Menu</h2>

        {groupedMenus.size === 0 ? (
          <div className="text-center py-xl">
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          Array.from(groupedMenus.entries()).map(([category, items]) => (
            <div key={category} className="mb-xl">
              <h3 className="text-2xl font-bold mb-lg text-primary">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    {...item}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
