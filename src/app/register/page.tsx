"use client";

import { useState } from "react";
import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { Button } from "@/components/Button";

type Role = "CUSTOMER" | "RESTAURANT" | "DELIVERY";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-md">
        <div className="bg-white rounded-lg shadow-lg p-lg w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-md text-primary">🍔 Yumm</h1>
          <h2 className="text-2xl font-bold mb-lg text-center text-gray-800">Create Account</h2>

          <p className="text-center text-gray-600 mb-xl">
            Choose how you want to join Yumm
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {[
              {
                role: "CUSTOMER" as Role,
                icon: "👤",
                title: "Customer",
                description: "Order delicious food from restaurants",
              },
              {
                role: "RESTAURANT" as Role,
                icon: "🏪",
                title: "Restaurant",
                description: "Sell your food to customers",
              },
              {
                role: "DELIVERY" as Role,
                icon: "🚴",
                title: "Delivery Partner",
                description: "Earn money delivering orders",
              },
            ].map((option) => (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className="card text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-md">{option.icon}</div>
                <h3 className="text-xl font-bold mb-sm">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-md">{option.description}</p>
                <div className="text-primary font-semibold">Get Started →</div>
              </button>
            ))}
          </div>

          <div className="mt-xl text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-md">
      <div className="bg-white rounded-lg shadow-lg p-lg w-full max-w-md">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-primary font-semibold mb-md hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center mb-md text-primary">🍔 Yumm</h1>

        <h2 className="text-2xl font-bold mb-lg text-center text-gray-800">
          Register as {selectedRole.toLowerCase()}
        </h2>

        <RegisterForm role={selectedRole} />

        <div className="mt-lg text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
