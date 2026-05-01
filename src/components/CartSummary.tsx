"use client";

import { useCart } from "@/hooks/useCart";
import { Button } from "./Button";

interface CartSummaryProps {
  onCheckout?: () => void;
  checkoutButtonLabel?: string;
}

export function CartSummary({
  onCheckout,
  checkoutButtonLabel = "Proceed to Checkout",
}: CartSummaryProps) {
  const { subtotal, deliveryFee, tax, total, itemCount } = useCart();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-lg sticky top-24">
      <h3 className="text-xl font-bold mb-lg">Order Summary</h3>

      <div className="space-y-md mb-lg border-b pb-lg">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">₹{deliveryFee.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Taxes (5%)</span>
          <span className="font-semibold">₹{tax.toFixed(0)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-lg">
        <span className="text-lg font-bold">Total</span>
        <span className="text-2xl font-bold text-primary">
          ₹{total.toFixed(0)}
        </span>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={onCheckout}
        disabled={itemCount === 0}
      >
        {checkoutButtonLabel}
      </Button>

      {itemCount === 0 && (
        <p className="text-sm text-gray-500 mt-md text-center">
          Add items to proceed
        </p>
      )}
    </div>
  );
}
