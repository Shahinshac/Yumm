"use client";

interface AdminStatsProps {
  totalUsers: number;
  customerCount: number;
  restaurantCount: number;
  deliveryCount: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  avgRating: number;
  totalReviews: number;
  todayOrders: number;
  todayRevenue: number;
}

export function AdminStats({
  totalUsers,
  customerCount,
  restaurantCount,
  deliveryCount,
  totalOrders,
  completedOrders,
  pendingOrders,
  totalRevenue,
  averageOrderValue,
  avgRating,
  totalReviews,
  todayOrders,
  todayRevenue,
}: AdminStatsProps) {
  const completionRate = totalOrders > 0
    ? Math.round((completedOrders / totalOrders) * 100)
    : 0;

  const statCards = [
    {
      label: "Total Users",
      value: totalUsers.toString(),
      icon: "👥",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Customers",
      value: customerCount.toString(),
      icon: "👤",
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      label: "Restaurants",
      value: restaurantCount.toString(),
      icon: "🏪",
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      label: "Delivery Partners",
      value: deliveryCount.toString(),
      icon: "🚴",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: "📦",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Completed",
      value: completedOrders.toString(),
      icon: "✅",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: "📊",
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(0)}`,
      icon: "💰",
      color: "bg-red-50 text-red-700 border-red-200",
    },
    {
      label: "Avg Order Value",
      value: `₹${averageOrderValue.toFixed(0)}`,
      icon: "📈",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      label: "Avg Rating",
      value: `${avgRating.toFixed(1)} ⭐`,
      icon: "⭐",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      label: "Total Reviews",
      value: totalReviews.toString(),
      icon: "💬",
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      label: "Today's Orders",
      value: todayOrders.toString(),
      icon: "📅",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      label: "Today's Revenue",
      value: `₹${todayRevenue.toFixed(0)}`,
      icon: "💵",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} border rounded-lg p-md text-center`}
        >
          <p className="text-2xl mb-md">{stat.icon}</p>
          <p className="text-sm font-semibold mb-xs">{stat.label}</p>
          <p className="text-xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
