import React from 'react';
import { ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

const RestaurantDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Restaurant Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-[#ff4b3a] rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-800">4</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Orders Completed</p>
            <p className="text-2xl font-bold text-gray-800">28</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-800">$432.50</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Incoming Orders</h2>
        <div className="text-center py-10 text-gray-500">
          No new orders to display.
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
