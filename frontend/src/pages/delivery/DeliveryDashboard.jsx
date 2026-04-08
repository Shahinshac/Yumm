import React from 'react';
import { Package, MapPin } from 'lucide-react';

const DeliveryDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Delivery Hub</h1>
      
      <div className="bg-[#1a1a2e] text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">Status</p>
          <h2 className="text-xl font-bold flex items-center gap-2 mt-1">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Online & Ready
          </h2>
        </div>
        <button className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg font-medium text-sm border border-white/10">
          Go Offline
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="text-[#ff4b3a]" /> Available Deliveries
        </h2>
        <div className="p-4 border rounded-lg hover:border-[#ff4b3a] transition cursor-pointer flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Pizza Paradise</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin size={14} /> 123 Main St. → 456 Elm St.
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600 text-lg">$6.50</p>
            <p className="text-xs text-gray-400">Est 15m</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
