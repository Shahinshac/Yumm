import React, { useState, useEffect } from 'react';
import { Package, MapPin, CheckCircle2, Navigation, Clock, Loader2 } from 'lucide-react';
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
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-black text-sm">
                    {order.id.slice(-2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Order #{order.id.slice(-8)}</h3>
                    <p className="text-xs text-gray-400 font-medium">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
                      <p className="text-sm text-gray-700 font-bold">{order.restaurant_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery To</p>
                      <p className="text-sm text-gray-700 font-bold">{order.customer_name} · {order.delivery_address || 'Address provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between md:justify-end gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earnings</p>
                    <p className="text-xl font-black text-gray-900">₹{order.delivery_fee || 40}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle2 size={14} /> Delivered
                    </span>
                  </div>
                </div>
                <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold py-2 rounded-xl text-xs transition">
                  View Full Details
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
