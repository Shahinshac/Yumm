"use client";

interface OrderStatusProps {
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✓" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready for Pickup", icon: "📦" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🚴" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

export function OrderStatus({ status, createdAt, estimatedDelivery }: OrderStatusProps) {
  const currentIndex = statusSteps.findIndex((step) => step.key === status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-lg">
      <h3 className="text-lg font-bold mb-lg">Order Status</h3>

      {/* Timeline */}
      <div className="space-y-md">
        {statusSteps.map((step, index) => (
          <div key={step.key} className="flex items-start gap-md">
            {/* Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                index <= currentIndex
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.icon}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <p
                className={`font-semibold ${
                  index <= currentIndex ? "text-primary" : "text-gray-500"
                }`}
              >
                {step.label}
              </p>
              {index === currentIndex && (
                <p className="text-sm text-gray-600 mt-1">In progress...</p>
              )}
              {index < currentIndex && (
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              )}
            </div>

            {/* Vertical line connector */}
            {index < statusSteps.length - 1 && (
              <div
                className={`absolute left-5 top-20 w-0.5 h-12 ${
                  index < currentIndex ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Timeline info */}
      <div className="mt-lg pt-lg border-t border-gray-200 space-y-md text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Order Placed</span>
          <span className="font-semibold">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
        {estimatedDelivery && (
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="font-semibold">
              {new Date(estimatedDelivery).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
