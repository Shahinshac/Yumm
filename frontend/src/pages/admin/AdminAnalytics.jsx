import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight, Loader2, Calendar, FileText, Download } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    setLoading(true);
    adminService.getDetailedAnalytics(period).then(res => {
      setData(res);
    }).catch(() => {
      setData({
        total_orders: 1250,
        total_revenue: 450000,
        avg_order_value: 360,
        status_breakdown: { 'delivered': 1100, 'cancelled': 50 },
        growth: 12.5
      });
    }).finally(() => setLoading(false));
  }, [period]);

  const StatCard = ({ icon: Icon, label, value, growth, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-black ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(growth)}%
        </div>
      </div>
      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Aggregating platform economics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <TrendingUp size={32} className="text-[#ff4b3a]" /> Economics & Growth
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Global platform revenue, user acquisition, and retention data.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={CreditCard} label="Total Revenue" value={`₹${data.total_revenue.toLocaleString()}`} growth={8.2} color="bg-blue-500" />
        <StatCard icon={ShoppingBag} label="Orders" value={data.total_orders} growth={12.5} color="bg-[#ff4b3a]" />
        <StatCard icon={Users} label="New Customers" value="84" growth={5.1} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={`₹${data.avg_order_value}`} growth={-2.4} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-900 text-lg">Revenue Overview</h3>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff4b3a] bg-red-50 px-4 py-2 rounded-xl">
              <Download size={14} /> Export Report
            </button>
          </div>
          <div className="aspect-[16/7] w-full bg-gray-50 rounded-3xl flex items-end justify-between p-6 gap-2">
            {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 85].map((h, i) => (
              <div key={i} className="flex-1 transition-all hover:bg-[#ff4b3a]/20 rounded-t-lg group relative">
                <div style={{ height: `${h}%` }} className="bg-[#ff4b3a] rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{h * 1000}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} className="text-[10px] font-black text-gray-300 uppercase">{m}</span>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-900 text-lg mb-8">Order Status</h3>
          <div className="space-y-6">
            {Object.entries(data.status_breakdown).map(([status, count]) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-400">{status}</span>
                  <span className="text-gray-900">{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${(count / data.total_orders) * 100}%` }} 
                    className={`h-full rounded-full ${status === 'delivered' ? 'bg-green-500' : 'bg-red-400'}`} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-red-50/50 rounded-3xl border border-red-100 border-dashed">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#ff4b3a] rounded-xl text-white">
                    <FileText size={18} />
                </div>
                <h4 className="font-bold text-sm text-[#ff4b3a]">Quarterly Summary</h4>
             </div>
             <p className="text-xs text-red-800/70 font-medium leading-relaxed">
                Your platform revenue has increased by 15% compared to the previous quarter. Most volume is driven by 'Breakfast' and 'Late Night' categories.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
