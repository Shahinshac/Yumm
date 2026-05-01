"use client";

import { useState, useEffect } from "react";

interface ETAProps {
  estimatedDelivery?: string;
  status: string;
}

export function ETA({ estimatedDelivery, status }: ETAProps) {
  const [minutesLeft, setMinutesLeft] = useState<number>(0);

  useEffect(() => {
    if (!estimatedDelivery || status === "delivered" || status === "cancelled") {
      return;
    }

    const calculateETA = () => {
      const deliveryTime = new Date(estimatedDelivery).getTime();
      const now = Date.now();
      const minutesRemaining = Math.max(0, Math.floor((deliveryTime - now) / 60000));
      setMinutesLeft(minutesRemaining);
    };

    calculateETA();

    const interval = setInterval(calculateETA, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedDelivery, status]);

  if (status === "delivered") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-lg text-center">
        <p className="text-green-700 font-semibold">✅ Delivered</p>
        <p className="text-sm text-green-600 mt-1">Your order has arrived</p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-lg text-center">
        <p className="text-red-700 font-semibold">❌ Cancelled</p>
      </div>
    );
  }

  if (!estimatedDelivery) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-lg text-center">
        <p className="text-gray-600">Calculating ETA...</p>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-lg text-center">
      <p className="text-sm text-gray-600 mb-md">Estimated Delivery</p>
      <div className="text-3xl font-bold text-primary mb-md">
        {minutesLeft} <span className="text-lg">min</span>
      </div>
      <p className="text-sm text-gray-600">
        {new Date(estimatedDelivery).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
