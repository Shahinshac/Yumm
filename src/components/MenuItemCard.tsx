"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";

interface MenuItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  onAddToCart?: (item: MenuItemCardProps) => void;
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  image,
  category,
  onAddToCart,
}: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart({ id, name, description, price, image, category });
    }
  };

  return (
    <div className="card flex flex-col">
      {/* Image */}
      <div className="relative w-full h-32 bg-gray-200 mb-md rounded-md overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Category Badge */}
      {category && (
        <div className="mb-xs">
          <span className="badge text-xs">{category}</span>
        </div>
      )}

      {/* Name */}
      <h3 className="font-bold text-lg mb-xs truncate">{name}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 mb-md line-clamp-2">
          {description}
        </p>
      )}

      {/* Price & Action */}
      <div className="mt-auto flex items-center justify-between gap-md">
        <div className="font-bold text-lg text-primary">
          ₹{price.toFixed(0)}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
        >
          Add +
        </Button>
      </div>
    </div>
  );
}
