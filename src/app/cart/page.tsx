"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { CartItemComponent } from "@/components/CartItem";
import { CartSummary } from "@/components/CartSummary";
import { Button } from "@/components/Button";

export default function CartPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-md">Please login to view your cart</p>
          <Button onClick={() => router.push("/login")}>Login</Button>
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
          <div className="flex gap-md">
            <Link href="/restaurants" className="btn-outline">
              Continue Shopping
            </Link>
            <Link href="/dashboard" className="btn-outline">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Shopping Cart</h2>

        {items.length === 0 ? (
          <div className="text-center py-xl">
            <p className="text-gray-500 text-xl mb-lg">Your cart is empty</p>
            <Link href="/restaurants">
              <Button variant="primary">Browse Restaurants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-md">
              {items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}

              <div className="flex gap-md">
                <Link href="/restaurants" className="flex-1">
                  <Button variant="outline" className="w-full">
                    ← Continue Shopping
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="text-danger"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <CartSummary
                onCheckout={() => router.push("/checkout")}
                checkoutButtonLabel="Proceed to Checkout"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
