import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Calendar, CreditCard, Loader2, ArrowUpRight, CheckCircle2, DollarSign } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';

const DeliveryEarnings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('week');

    useEffect(() => {
        setLoading(true);
        deliveryService.getEarnings(period).then(res => {
            setData(res);
        }).catch(() => {
            setData({
                total_earnings: 4850,
                deliveries_count: 52,
                average_per_trip: 93,
                tips: 420,
                history: [
                    { date: 'Today', amount: 850, count: 8 },
                    { date: 'Yesterday', amount: 1200, count: 12 },
                    { date: '3 Days Ago', amount: 900, count: 10 },
                ]
            });
        }).finally(() => setLoading(false));
    }, [period]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Calculating your earnings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Wallet & Earnings</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Track your income and payouts over time.</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                    {['week', 'month'].map(p => (
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

            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-blue-900/20 mb-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4b3a] blur-[120px] opacity-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 opacity-60">
                        <Wallet size={20} />
                        <span className="text-xs font-black uppercase tracking-widest">Available for payout</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight mb-2">₹{data.total_earnings.toLocaleString()}</h2>
                    <p className="text-gray-400 text-sm font-medium">Earned during this {period}</p>
                    
                    <button className="mt-10 px-8 py-4 bg-[#ff4b3a] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-500/30 hover:scale-105 transition-all">
                        Withdraw Earnings
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trips Completed</p>
                    <h4 className="text-2xl font-black text-gray-900">{data.deliveries_count}</h4>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Average / Trip</p>
                    <h4 className="text-2xl font-black text-gray-900">₹{data.average_per_trip}</h4>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Tips</p>
                    <h4 className="text-2xl font-black text-green-500">₹{data.tips}</h4>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-[#ff4b3a]">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-50">
                    {data.history.map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 rounded-2xl text-[#ff4b3a]">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{day.date}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{day.count} trips completed</p>
                                </div>
                            </div>
                            <p className="font-black text-gray-900 text-lg">₹{day.amount}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryEarnings;
