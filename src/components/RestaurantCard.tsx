"use client";

import Link from "next/link";
import Image from "next/image";

interface RestaurantCardProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating: number;
  address: string;
  menuCount?: number;
  reviewCount?: number;
}

export function RestaurantCard({
  id,
  name,
  description,
  image,
  rating,
  address,
  menuCount = 0,
  reviewCount = 0,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${id}`}>
      <div className="card group cursor-pointer overflow-hidden h-full flex flex-col hover:shadow-xl transition-all">
        {/* Image */}
        <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-primary/10 to-secondary/10">
              🏪
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-md">
          {/* Rating */}
          <div className="flex items-center justify-between mb-sm">
            <h3 className="font-bold text-lg truncate">{name}</h3>
            <div className="flex items-center gap-xs bg-accent/20 px-sm py-xs rounded-full">
              <span className="text-accent font-bold">⭐ {rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 mb-sm line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex gap-md text-xs text-gray-500 mb-md">
            {menuCount > 0 && <span>🍽️ {menuCount} items</span>}
            {reviewCount > 0 && <span>⭐ {reviewCount} reviews</span>}
          </div>

          {/* Address */}
          <p className="text-xs text-gray-500 mt-auto flex items-start gap-xs">
            <span>📍</span>
            <span className="truncate">{address}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
