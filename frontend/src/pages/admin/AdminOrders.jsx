import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Loader2, Calendar, Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminService.getAllOrders().then(res => {
      setOrders(res.orders || []);
    }).catch(() => {
      setOrders([]);
    }).finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'placed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'accepted': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle2 size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const filtered = orders.filter(o => filter === 'all' || o.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-gray-500 font-medium text-sm">Synchronizing platform order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Orders</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitoring real-time order flow and delivery performance.</p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-3 text-sm font-bold text-gray-600 shadow-sm">
          <Package size={18} className="text-[#ff4b3a]" /> {orders.length} Global Orders
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'placed', 'accepted', 'delivered', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === s ? 'bg-[#ff4b3a] text-white shadow-lg shadow-red-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-red-100 hover:text-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-5">Order ID & Date</th>
                <th className="px-8 py-5">Restaurant</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.length === 0 ? (
                  <tr>
                      <td colSpan="6" className="px-8 py-20 text-center">
                          <AlertCircle size={40} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-gray-400 font-bold">No orders found in this category.</p>
                      </td>
                  </tr>
              ) : (
                filtered.map(order => (
                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-gray-900 text-xs">#{order.id.slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-1">
                      <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-800">{order.restaurant_name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{order.items?.length || 0} Items</p>
                  </td>
                  <td className="px-8 py-5 uppercase">
                    <p className="font-bold text-gray-800 text-xs leading-none">{order.customer_username}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-gray-900">₹{order.total_amount}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-[#ff4b3a] hover:text-white rounded-xl transition-all shadow-sm">
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
