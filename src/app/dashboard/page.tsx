"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/Button";

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating: number;
  address: string;
  menuCount: number;
  reviewCount: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRestaurants();
    }
  }, [isAuthenticated]);

  const loadRestaurants = async () => {
    setLoading(true);
    const result = await apiCall<any>("/restaurants?limit=6&sortBy=rating");
    if (result.success && result.data) {
      setRestaurants(result.data.data || []);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/restaurants?search=${encodeURIComponent(query)}`);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-lg flex items-center justify-between">
          <div className="flex items-center gap-md">
            <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
            <div className="hidden md:block text-gray-600">
              Welcome, {user?.name}!
            </div>
          </div>
          <div className="flex items-center gap-md">
            <Link href="/restaurants" className="btn-secondary">
              Browse All
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="btn-outline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-xl">
        <div className="container mx-auto px-md">
          <h2 className="text-4xl font-bold mb-md">Order Food Online</h2>
          <p className="text-lg mb-lg opacity-90">
            Fast delivery • Fresh food • Best prices
          </p>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-xl">
        <div className="container mx-auto px-md">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-3xl font-bold">Featured Restaurants</h3>
            <Link href="/restaurants" className="text-primary font-semibold hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-xl">
              <p className="text-gray-500">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-xl">
              <p className="text-gray-500">No restaurants available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-xl border-t">
        <div className="container mx-auto px-md">
          <h3 className="text-2xl font-bold mb-lg text-center">Why Choose Yumm?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {[
              {
                icon: "⚡",
                title: "Fast Delivery",
                desc: "Get your food in 30 minutes or less",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                desc: "Safe and encrypted transactions",
              },
              {
                icon: "⭐",
                title: "Quality Assured",
                desc: "Top-rated restaurants and reviews",
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-md">{feature.icon}</div>
                <h4 className="font-bold mb-sm">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
