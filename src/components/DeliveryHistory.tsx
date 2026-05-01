"use client";

interface Delivery {
  id: string;
  deliveryFee: number;
  createdAt: string;
}

interface DeliveryHistoryProps {
  deliveries: Delivery[];
}

export function DeliveryHistory({ deliveries }: DeliveryHistoryProps) {
  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-lg text-center">
        <p className="text-gray-500">No delivery history yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-lg py-md text-left text-sm font-semibold">Order ID</th>
            <th className="px-lg py-md text-left text-sm font-semibold">Date</th>
            <th className="px-lg py-md text-right text-sm font-semibold">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((delivery, idx) => (
            <tr
              key={delivery.id}
              className={`border-b border-gray-200 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <td className="px-lg py-md font-mono text-sm">
                #{delivery.id.slice(-8)}
              </td>
              <td className="px-lg py-md text-sm">
                {new Date(delivery.createdAt).toLocaleDateString()} at{" "}
                {new Date(delivery.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-lg py-md text-right font-semibold text-green-600">
                +₹{delivery.deliveryFee.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
