"use client";

import { useState } from "react";

interface FilterPanelProps {
  onFilterChange: (filters: { sortBy: string; minRating: number }) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [sortBy, setSortBy] = useState("rating");
  const [minRating, setMinRating] = useState(0);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    onFilterChange({ sortBy: newSort, minRating });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRating = parseFloat(e.target.value);
    setMinRating(newRating);
    onFilterChange({ sortBy, minRating: newRating });
  };

  return (
    <div className="flex flex-wrap gap-md">
      {/* Sort */}
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium">Sort by</label>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="input py-sm"
        >
          <option value="rating">⭐ Highest Rated</option>
          <option value="name">A-Z Name</option>
          <option value="newest">🆕 Newest</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium">Min Rating</label>
        <select
          value={minRating}
          onChange={handleRatingChange}
          className="input py-sm"
        >
          <option value="0">All Ratings</option>
          <option value="3">3★ & Up</option>
          <option value="3.5">3.5★ & Up</option>
          <option value="4">4★ & Up</option>
          <option value="4.5">4.5★ & Up</option>
        </select>
      </div>
    </div>
  );
}
