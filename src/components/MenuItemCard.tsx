"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { useCart } from "@/hooks/useCart";

interface MenuItemCardProps {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

export function MenuItemCard({
  id,
  restaurantId,
  restaurantName,
  name,
  description,
  price,
  image,
  category,
}: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id,
      restaurantId,
      restaurantName,
      name,
      description,
      price,
      image,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
      <div className="mt-auto flex items-center justify-between gap-md flex-wrap">
        <div>
          <div className="font-bold text-lg text-primary">
            ₹{price.toFixed(0)}
          </div>
          <div className="flex items-center gap-sm border border-gray-300 rounded px-xs py-xs mt-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-primary hover:bg-gray-100 px-xs"
            >
              −
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="text-primary hover:bg-gray-100 px-xs"
            >
              +
            </button>
          </div>
        </div>
        <Button
          variant={added ? "secondary" : "primary"}
          size="sm"
          onClick={handleAddToCart}
        >
          {added ? "✓ Added" : "Add +"}
        </Button>
      </div>
    </div>
  );
}

