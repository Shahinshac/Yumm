import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await restaurantService.getOrders(activeTab === 'all' ? '' : activeTab);
      setOrders(data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-purple-100 text-purple-700';
      case 'on_the_way': return 'bg-blue-600 text-white';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Order History</h1>
        <p className="text-sm text-gray-500 mt-1">Review your restaurant's order performance and sales.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
        {['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all shrink-0 ${
              activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No orders found</h2>
          <p className="text-gray-500 mt-2">Orders matching the selected status will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 uppercase tracking-tight text-xs">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5">
                      <p className="font-black text-gray-900">#{order.id.slice(-5)}</p>
                      <p className="text-gray-400 mt-1">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-gray-600 font-bold">
                            {item.quantity} × {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-gray-900">₹{order.total_amount}</td>
                    <td className="px-6 py-5">
                      <button className="flex items-center gap-1 text-orange-500 font-black hover:underline">
                        Details <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
