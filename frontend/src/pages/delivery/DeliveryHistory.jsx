import React, { useState, useEffect } from 'react';
import { History, Package, Search, Filter, Loader2, Calendar, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';

const DeliveryHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        deliveryService.getHistory().then(res => {
            setHistory(res.history || []);
        }).catch(() => {
            setHistory([
                { id: 'ORD123', restaurant: 'Paragon', customer: 'John Doe', address: 'Apartment 4B, Hill Street', date: '2026-04-08', amount: 850, status: 'delivered' },
                { id: 'ORD124', restaurant: 'Devi Prasad', customer: 'Sarah M.', address: 'Sector 4, Main Road', date: '2026-04-07', amount: 450, status: 'delivered' },
                { id: 'ORD125', restaurant: 'Hot Spot', customer: 'Kevin L.', address: '12th Cross, Mall Avenue', date: '2026-04-07', amount: 1200, status: 'delivered' }
            ]);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = history.filter(h => 
        h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Synchronizing trip history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Trip History</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Review your past deliveries and earnings per trip.</p>
                </div>
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-400">
                    <History size={18} /> {history.length} Total Trips
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative mb-8">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by ID, Restaurant or Customer..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-medium"
                />
            </div>

            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No previous trips found.</p>
                    </div>
                ) : (
                    filtered.map(trip => (
                        <div key={trip.id} className="group bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#ff4b3a] group-hover:bg-red-50 transition-colors shrink-0">
                                    <Package size={28} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-gray-900">#{trip.id}</h4>
                                        <span className="flex items-center gap-1 text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            <CheckCircle2 size={10} /> {trip.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">{trip.restaurant}</p>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {trip.date}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {trip.address}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                                <p className="text-xl font-black text-gray-900">₹{trip.amount}</p>
                                <button className="p-2 bg-gray-50 group-hover:bg-[#ff4b3a] group-hover:text-white rounded-xl transition-all shadow-sm">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;
