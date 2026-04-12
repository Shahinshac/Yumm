import React, { useState, useEffect } from 'react';
import { Package, MapPin, CheckCircle2, Navigation, Clock, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/delivery/my-orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-green-500 mb-4" />
        <p className="text-gray-500 font-medium">Fetching delivery history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">My Deliveries</h1>
        <p className="text-sm text-gray-500 mt-1">Review your completed trips and total earnings.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Navigation size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No completed trips</h2>
          <p className="text-gray-500 mt-2">When you fulfill an order, it will show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition flex flex-col md:flex-row gap-6">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                       {order.id.slice(-2)}
                     </div>
                     <div className="min-w-0">
                       <h3 className="font-bold text-gray-900 truncate">Order #{order.id.slice(-8)}</h3>
                       <p className="text-xs text-gray-400 font-medium">
                         {new Date(order.created_at).toLocaleDateString()} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                     </div>
                  </div>
                  <div className="text-right shrink-0 block md:hidden">
                    <span className="inline-flex flex-col items-end">
                       <span className="text-lg font-black text-green-500">₹{(order.delivery_fee || 40) + (order.tip_amount || 0)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup Store</p>
                      <p className="text-sm text-gray-800 font-bold truncate">{order.restaurant_name}</p>
                    </div>
                  </div>
                  <div className="pl-[3px]">
                     <div className="w-0.5 h-4 bg-gray-200"></div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                      <p className="text-sm text-gray-800 font-bold line-clamp-2">{order.customer_name} · {order.delivery_address || 'Address provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-500 px-1">
                   <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span>{order.items?.reduce((acc, item) => acc + item.quantity, 0) || order.items?.length || 1} Items Delivered</span>
                   </div>
                   <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 size={14} /> Completed
                   </span>
                </div>
              </div>

              <div className="hidden md:flex border-l border-gray-100 pl-6 flex-col justify-center items-end min-w-[200px]">
                <div className="w-full space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                     <span>Base Payout</span>
                     <span>₹{order.delivery_fee || 40}</span>
                  </div>
                  {order.tip_amount > 0 && (
                     <div className="flex justify-between text-xs text-orange-500 font-bold">
                        <span>Customer Tip</span>
                        <span>+₹{order.tip_amount}</span>
                     </div>
                  )}
                  <div className="pt-2 border-t border-gray-100 flex justify-between">
                     <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Net Earning</span>
                     <span className="text-2xl font-black text-green-500">₹{(order.delivery_fee || 40) + (order.tip_amount || 0)}</span>
                  </div>
                </div>
                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-xs transition flex justify-center items-center gap-2">
                  View Full Details <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;
