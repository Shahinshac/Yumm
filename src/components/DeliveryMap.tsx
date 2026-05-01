"use client";

interface DeliveryMapProps {
  deliveryPartner?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  status: string;
}

export function DeliveryMap({ deliveryPartner, status }: DeliveryMapProps) {
  if (!deliveryPartner || status !== "out_for_delivery") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-lg">
        <p className="text-gray-500 text-center py-lg">
          Map will appear when delivery partner is assigned
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map placeholder */}
      <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <p className="text-gray-500">📍 Live map coming soon</p>
      </div>

      {/* Delivery partner info */}
      <div className="p-lg border-t border-gray-200">
        <h4 className="font-semibold mb-md">Your Delivery Partner</h4>
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
            {deliveryPartner.avatar || "🚴"}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{deliveryPartner.name}</p>
            <p className="text-sm text-gray-600">{deliveryPartner.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
