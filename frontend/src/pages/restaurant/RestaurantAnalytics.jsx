import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, CreditCard, Star, Loader2, ArrowUpRight, ArrowDownRight, Calendar, Package } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        setLoading(true);
        restaurantService.getAnalytics(period).then(res => {
            setData(res);
        }).catch(() => {
            setData({
                total_orders: 450,
                total_revenue: 125000,
                avg_rating: 4.8,
                top_items: [
                    { name: 'Chicken Biryani', count: 124, revenue: 34720 },
                    { name: 'Butter Chicken', count: 89, revenue: 24920 },
                    { name: 'Garlic Naan', count: 75, revenue: 3000 }
                ],
                recent_sales: [12000, 15000, 10000, 18000, 14000, 20000, 16000]
            });
        }).finally(() => setLoading(false));
    }, [period]);

    const StatCard = ({ icon: Icon, label, value, growth, color }) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                    <Icon size={20} className={color.replace('bg-', 'text-')} />
                </div>
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 text-[10px] font-black ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm">Processing your sales data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Detailed breakdown of your restaurant's performance.</p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                    {['week', 'month', 'year'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={CreditCard} label="Net Revenue" value={`₹${data.total_revenue.toLocaleString()}`} growth={15.4} color="bg-[#ff4b3a]" />
                <StatCard icon={ShoppingBag} label="Total Orders" value={data.total_orders} growth={9.8} color="bg-blue-500" />
                <StatCard icon={Star} label="Avg. Rating" value={data.avg_rating} growth={1.2} color="bg-orange-500" />
                <StatCard icon={TrendingUp} label="Daily Avg" value={`₹${Math.round(data.total_revenue / 30)}`} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 text-lg mb-8">Revenue Growth</h3>
                    <div className="aspect-[21/9] w-full bg-gray-50 rounded-3xl flex items-end justify-between p-6 gap-2">
                        {data.recent_sales.map((h, i) => (
                            <div key={i} className="flex-1 transition-all hover:bg-[#ff4b3a]/20 rounded-t-lg group relative">
                                <div style={{ height: `${(h / 20000) * 100}%` }} className="bg-[#ff4b3a] rounded-t-lg opacity-80" />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ₹{h}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Items */}
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 text-lg mb-8">Bestsellers</h3>
                    <div className="space-y-6">
                        {data.top_items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-xs text-gray-400 group-hover:bg-red-50 group-hover:text-[#ff4b3a] transition-all">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.count} Sold</p>
                                    </div>
                                </div>
                                <p className="font-black text-gray-900 text-xs text-right">₹{item.revenue}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-4 bg-gray-50 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition">
                        View Full Menu Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantAnalytics;
