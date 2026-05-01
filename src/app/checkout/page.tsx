"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { apiCall } from "@/lib/api";
import { CartSummary } from "@/components/CartSummary";
import { Button } from "@/components/Button";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, total } = useCart();
  const { isAuthenticated, user, accessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    loadAddresses();
  }, [isAuthenticated, items.length, router]);

  const loadAddresses = async () => {
    const result = await apiCall<Address[]>("/addresses", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (result.success && result.data) {
      setAddresses(result.data);
      // Auto-select default address
      const defaultAddress = result.data.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (result.data.length > 0) {
        setSelectedAddressId(result.data[0].id);
      }
    }
    setLoading(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await apiCall("/addresses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newAddress),
    });

    if (result.success) {
      await loadAddresses();
      setNewAddress({ street: "", city: "", state: "", zipCode: "" });
      setShowAddressForm(false);
    } else {
      setError(result.error || "Failed to add address");
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address");
      return;
    }

    if (items.length === 0) {
      setError("Cart is empty");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Get the first item's restaurant ID (for this demo, all items should be from same restaurant)
      const restaurantId = items[0].restaurantId;

      const result = await apiCall<any>("/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          restaurantId,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          notes: `Deliver to address ID: ${selectedAddressId}`,
          deliveryFee: 50,
          tax: Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05),
        }),
      });

      if (result.success && result.data) {
        clearCart();
        const orderId = (result.data as any).id || "confirmation";
        router.push(`/orders/${orderId}`);
      } else {
        setError(result.error || "Failed to place order");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-md py-md flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🍔 Yumm</h1>
          <Link href="/cart" className="btn-outline">
            ← Back to Cart
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-md py-lg">
        <h2 className="text-3xl font-bold mb-lg">Checkout</h2>

        {error && (
          <div className="bg-danger bg-opacity-10 border border-danger text-danger px-md py-sm rounded-md mb-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg p-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-md">Delivery Address</h3>

              {loading ? (
                <p className="text-gray-500">Loading addresses...</p>
              ) : (
                <>
                  <div className="space-y-md mb-lg">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex items-start p-md border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-xs"
                        />
                        <div className="ml-md flex-1">
                          <p className="font-semibold">
                            {address.street}, {address.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.state} - {address.zipCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="w-full"
                  >
                    {showAddressForm ? "Cancel" : "+ Add New Address"}
                  </Button>

                  {showAddressForm && (
                    <form
                      onSubmit={handleAddAddress}
                      className="mt-md p-md bg-gray-50 rounded-md space-y-md"
                    >
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                        required
                        className="input"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        required
                        className="input"
                      />
                      <div className="grid grid-cols-2 gap-md">
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                          required
                          className="input"
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={newAddress.zipCode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, zipCode: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <Button type="submit" variant="primary" className="w-full">
                        Save Address
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-md">Payment Method</h3>

              <div className="space-y-md">
                <label className="flex items-center p-md border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
                  />
                  <span className="ml-md font-semibold">💵 Cash on Delivery</span>
                </label>

                <label className="flex items-center p-md border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card")}
                  />
                  <span className="ml-md font-semibold">💳 Card Payment</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary & Place Order */}
          <div>
            <CartSummary
              onCheckout={handleCheckout}
              checkoutButtonLabel={processing ? "Processing..." : "Place Order"}
            />
            <div className="mt-md text-xs text-gray-500 text-center">
              By placing an order, you agree to our Terms & Conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
