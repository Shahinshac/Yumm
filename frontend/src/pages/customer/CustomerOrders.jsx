import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, CheckCircle2, XCircle, Loader2, Navigation } from 'lucide-react';
import { customerService } from '../../services/customerService';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService.getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'on_the_way': return 'bg-blue-100 text-blue-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff4b3a] mb-4" />
        <p className="text-gray-500 font-medium">Fetching your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Your Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage your previous cravings.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
          <p className="text-gray-500 mt-2">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group cursor-pointer">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-orange-50 transition">
                    <img src={order.restaurant_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=50&q=80'} className="w-10 h-10 rounded-lg object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{order.restaurant_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={12} /> {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="flex items-center justify-end gap-1 text-[#ff4b3a] font-black text-sm mt-2">
                    ₹{order.total_amount} <ChevronRight size={14} />
                  </div>
                </div>
              </div>
              
              {/* Collapsed details snippet */}
              <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-500 truncate max-w-[70%]">
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
                {order.status === 'delivered' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                    <CheckCircle2 size={12} /> Rate Food
                  </span>
                )}
                {['accepted', 'assigned', 'picked'].includes(order.status) && (
                  <Link 
                    to={`/orders/${order.id}/track`}
                    className="flex items-center gap-1 text-[10px] font-black text-[#ff4b3a] bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-[#ff4b3a] hover:text-white transition-all shadow-sm"
                  >
                    <Navigation size={12} fill="currentColor" /> Track Live
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
