import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, XCircle, Search, Filter, Loader2, ArrowRight, Play, Check } from 'lucide-react';
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

  const handleUpdateStatus = async (id, status) => {
      try {
          await restaurantService.updateOrderStatus(id, status);
          await loadOrders();
      } catch (err) {
          alert("Status update failed.");
      }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'preparing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ready': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'on_the_way': return 'bg-blue-600 text-white border-blue-600';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Active Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage incoming requests and production flow.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8">
        {['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-500 hover:text-orange-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing kitchen...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-200" />
          </div>
          <h2 className="text-xl font-black text-gray-900">No Orders Currently</h2>
          <p className="text-gray-500 mt-2 font-medium">When customers order, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-black text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border-2 ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={12} /> {new Date(order.created_at).toLocaleTimeString()}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-orange-50 text-orange-600 rounded-md flex items-center justify-center text-[10px] font-black">{item.quantity}</div>
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-4 min-w-[200px]">
                        <p className="text-3xl font-black text-gray-900">₹{order.total_amount}</p>
                        
                        <div className="flex gap-2 w-full">
                            {order.status === 'pending' && (
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                    className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-xs font-black hover:bg-orange-600 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    <Play size={14} /> START COOKING
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'ready')}
                                    className="flex-1 bg-green-500 text-white py-3 rounded-xl text-xs font-black hover:bg-green-600 transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-100"
                                >
                                    <Check size={14} /> MARK AS READY
                                </button>
                            )}
                            {order.status !== 'pending' && order.status !== 'preparing' && (
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-full py-2">
                                    {order.status === 'ready' ? 'Waiting for Pickup' : 'Movement Started'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
