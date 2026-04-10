import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, TrendingUp, IndianRupee, Star, Clock, CheckCircle, 
  XCircle, ChevronRight, Package, Users, Loader2, Signal, BellRing
} from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const STATUS_STYLES = {
  pending: { label: 'New Order', cls: 'bg-red-50 text-red-500 border-red-100' },
  preparing: { label: 'Preparing', cls: 'bg-blue-50 text-blue-500 border-blue-100' },
  completed: { label: 'Handed Over', cls: 'bg-green-50 text-green-500 border-green-100' },
  ready: { label: 'Ready', cls: 'bg-indigo-50 text-indigo-500 border-indigo-100' },
  waiting: { label: 'Awaiting Rider', cls: 'bg-purple-50 text-purple-500 border-purple-100' },
  rejected: { label: 'Cancelled', cls: 'bg-gray-50 text-gray-500 border-gray-100' },
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
        <Icon size={24} className={color} />
      </div>
      <div className="flex flex-col items-end">
         <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">+12%</span>
         <TrendingUp size={14} className="text-green-500" />
      </div>
    </div>
    <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{label}</p>
  </div>
);

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await restaurantService.getOrders(activeFilter === 'all' ? '' : activeFilter);
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeFilter]);

  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'preparing') {
        await restaurantService.acceptOrder(id);
      } else if (newStatus === 'rejected') {
        await restaurantService.rejectOrder(id);
      } else {
        await restaurantService.updateOrderStatus(id, newStatus);
      }
      fetchOrders();
    } catch {
      alert('Network Error: Could not update Kitchen state.');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-[#e23744] mb-6" />
        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.3em]">Kitchen Syncing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20 font-sans">

      {/* ENTERPRISE DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-[#e23744] rounded-full animate-ping" />
              <span className="text-[10px] font-black text-[#e23744] uppercase tracking-[0.3em]">Live Terminal</span>
           </div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">Kitchen Master</h1>
           <p className="text-gray-400 font-bold text-sm mt-2">Global Operations Control • Merchant ID: #YUMM-RE-78</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-gray-50 p-2 rounded-2xl flex items-center gap-3 px-4 border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kitchen Status</span>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 shadow-inner ${isOpen ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-md ${isOpen ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
           </div>
           <button className="bg-black text-white p-4 rounded-2xl hover:scale-105 transition-transform shadow-xl">
              <BellRing size={20} />
           </button>
        </div>
      </div>

      {/* OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={ShoppingBag} label="Active Orders" value={orders.length} color="text-red-500" />
        <StatCard icon={CheckCircle} label="Success Rate" value="98%" color="text-green-500" />
        <StatCard icon={IndianRupee} label="Daily Revenue" value="₹14,500" color="text-blue-500" />
      </div>

      {/* ORDER MANAGEMENT ENGINE */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-10 py-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
              <Signal size={24} />
            </div>
            <div>
              <h2 className="font-black text-xl text-gray-900 tracking-tight">Active Queue</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Real-time Synchronization</p>
            </div>
          </div>

          <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            {['all', 'pending', 'preparing', 'completed'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-xl capitalize font-black text-[10px] transition-all tracking-widest ${activeFilter === f ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#fafafa]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
               <Package size={32} className="text-gray-200" />
            </div>
            <p className="font-black text-gray-900 text-lg">Queue Empty</p>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Ready for next rush</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              return (
                <div key={order.id} className="flex flex-col md:flex-row md:items-center gap-8 px-10 py-10 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-black text-2xl text-gray-900 tracking-tighter">#{order.id.slice(-4).toUpperCase()}</span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 font-bold text-sm">
                       <span className="text-gray-900">{order.customer || 'External Guest'}</span>
                       <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                       <span className="line-clamp-1">{order.items || 'Standard Meal'}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <Clock size={12} /> Received 5m ago
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-400 uppercase tracking-widest cursor-pointer hover:underline">
                          View details <ChevronRight size={12} />
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.total}</span>
                    <div className="flex gap-2">
                       {order.status === 'pending' ? (
                         <>
                            <button
                              onClick={() => updateStatus(order.id, 'preparing')}
                              className="px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-xl"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, 'rejected')}
                              className="p-3 bg-white border border-gray-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition shadow-sm"
                            >
                              <XCircle size={20} />
                            </button>
                         </>
                       ) : order.status === 'preparing' ? (
                          <button
                            onClick={() => updateStatus(order.id, 'ready')}
                            className="px-8 py-3 bg-[#e23744] text-white hover:bg-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-xl shadow-red-100"
                          >
                            Mark Ready
                          </button>
                       ) : (
                         <div className="bg-green-50 p-3 rounded-2xl text-green-500">
                           <CheckCircle size={24} />
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] leading-relaxed">
         Powered by YUMM Nexus • Operations Integrity Protocol 9.0
      </p>
    </div>
  );
};

export default RestaurantDashboard;
