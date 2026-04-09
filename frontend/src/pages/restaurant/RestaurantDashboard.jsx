import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, IndianRupee, Star, Clock, CheckCircle, XCircle, ChevronRight, Package, Users } from 'lucide-react';

const ORDERS = [];

const STATUS_STYLES = {
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  preparing: { label: 'Preparing', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600' },
};

const StatCard = ({ icon: Icon, label, value, sub, iconColor, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`${iconBg} p-3 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
      <TrendingUp size={14} className="text-green-400" />
    </div>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState(ORDERS);
  const [activeFilter, setActiveFilter] = useState('all');

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const filtered = activeFilter === 'all' ? orders : orders.filter(o => o.status === activeFilter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your orders and track performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Restaurant Open
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Pending Orders" value="4" sub="Needs attention" iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard icon={CheckCircle} label="Completed Today" value="28" sub="+12% vs yesterday" iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={IndianRupee} label="Today's Revenue" value="₹4,320" sub="Gross earnings" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard icon={Star} label="Avg Rating" value="4.7" sub="Based on 142 reviews" iconColor="text-yellow-500" iconBg="bg-yellow-50" />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-800">Incoming Orders</h2>
          </div>
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'pending', 'preparing', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${activeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CheckCircle size={40} className="mb-3 text-green-300" />
            <p className="font-medium">No orders in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(order => {
              const s = STATUS_STYLES[order.status];
              return (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{order.customer} · {order.items}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={11} /> {order.time}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-gray-900">₹{order.total}</span>
                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(order.id, 'preparing')}
                          className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle size={13} /> Accept
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition"
                      >
                        Mark Ready
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
