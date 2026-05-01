"use client";

import Image from "next/image";
import { CartItem } from "@/context/CartContext";
import { useCart } from "@/hooks/useCart";
import { Button } from "./Button";

interface CartItemComponentProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-md p-md bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-20 h-20 bg-gray-200 rounded-md flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🍽️
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <h3 className="font-bold text-lg">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.restaurantName}</p>
        <p className="text-primary font-bold mt-xs">₹{item.price.toFixed(0)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-sm border border-gray-300 rounded-md px-sm py-xs">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="font-bold text-primary hover:bg-gray-100 px-xs py-xs rounded"
        >
          −
        </button>
        <span className="w-8 text-center font-bold">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="font-bold text-primary hover:bg-gray-100 px-xs py-xs rounded"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-bold text-lg">
          ₹{(item.price * item.quantity).toFixed(0)}
        </p>
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-danger hover:underline mt-xs"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
