"use client";

interface EarningsStatsProps {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  completedDeliveries: number;
  activeDeliveries: number;
  averageEarningsPerDelivery: number;
}

export function EarningsStats({
  totalEarnings,
  todayEarnings,
  weekEarnings,
  completedDeliveries,
  activeDeliveries,
  averageEarningsPerDelivery,
}: EarningsStatsProps) {
  const statCards = [
    {
      label: "Total Earnings",
      value: `₹${totalEarnings.toFixed(0)}`,
      icon: "💰",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      label: "Today's Earnings",
      value: `₹${todayEarnings.toFixed(0)}`,
      icon: "📅",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "This Week",
      value: `₹${weekEarnings.toFixed(0)}`,
      icon: "📊",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Completed Deliveries",
      value: completedDeliveries.toString(),
      icon: "✅",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      label: "Active Deliveries",
      value: activeDeliveries.toString(),
      icon: "🚴",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      label: "Avg per Delivery",
      value: `₹${averageEarningsPerDelivery.toFixed(0)}`,
      icon: "📈",
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} border rounded-lg p-md text-center`}
        >
          <p className="text-3xl mb-md">{stat.icon}</p>
          <p className="text-sm font-semibold mb-xs">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
