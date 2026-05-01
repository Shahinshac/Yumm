"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { apiCall } from "@/lib/api";
import { RestaurantCard } from "@/components/RestaurantCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
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

interface ApiResponse {
  data: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("rating");
  const [minRating, setMinRating] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      sortBy,
      minRating: minRating.toString(),
    });

    if (search) {
      params.set("search", search);
    }

    const result = await apiCall<ApiResponse>(`/restaurants?${params.toString()}`);
    if (result.success && result.data) {
      setRestaurants(result.data.data || []);
      setPagination(result.data.pagination);
    }
    setLoading(false);
  }, [page, search, sortBy, minRating]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleFilterChange = (filters: {
    sortBy: string;
    minRating: number;
  }) => {
    setSortBy(filters.sortBy);
    setMinRating(filters.minRating);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md">
          <div className="flex items-center justify-between mb-md">
            <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button>
          </div>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        {/* Filters */}
        <div className="mb-lg">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {/* Results Count */}
        <div className="mb-lg">
          <p className="text-gray-600">
            Showing <span className="font-bold">{restaurants.length}</span> of{" "}
            <span className="font-bold">{pagination.total}</span> restaurants
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="text-center py-xl">
            <p className="text-gray-500">Loading restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-xl">
            <p className="text-gray-500 text-lg">
              {search
                ? `No restaurants found for "${search}"`
                : "No restaurants available"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-md flex-wrap">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </Button>

                <div className="flex items-center gap-sm">
                  {Array.from({
                    length: Math.min(5, pagination.totalPages),
                  }).map((_, i) => {
                    const pageNum =
                      pagination.totalPages > 5
                        ? Math.max(1, page - 2) + i
                        : i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-md py-sm rounded-md transition-all ${
                          page === pageNum
                            ? "bg-primary text-white font-bold"
                            : "bg-white border border-gray-300 hover:border-primary"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
