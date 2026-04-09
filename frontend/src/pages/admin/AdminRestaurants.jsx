import React, { useState, useEffect } from 'react';
import { Store, Search, Filter, Loader2, Star, MapPin, ChevronRight, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminService.getRestaurants().then(res => {
      setRestaurants(res.restaurants || []);
    }).catch(() => {
      setRestaurants([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.category?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && r.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
        <p className="text-gray-500 font-medium text-sm text-[#ff4b3a]">Loading global restaurant directory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Restaurant Partners</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage all onboarded food partners.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-400">
                <Store size={16} /> {restaurants.length} Total Partners
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Filter size={16} className="text-[#ff4b3a]" /> Filters
            </h3>
            <div className="space-y-2">
              {['all', 'active', 'inactive'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    filter === f ? 'bg-red-50 text-[#ff4b3a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, category or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
                <div className="md:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No restaurants found matching your criteria.</p>
                </div>
            ) : (
                filtered.map(restaurant => (
                <div key={restaurant.id} className="group bg-white rounded-3xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-red-50/50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:bg-red-50 transition-colors">
                                {restaurant.image || '🍛'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-[#ff4b3a] transition-colors">{restaurant.name}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{restaurant.category}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                <Star size={12} fill="currentColor" /> {restaurant.rating || 'N/A'}
                            </div>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Min Order</p>
                            <p className="text-xs font-bold text-gray-900 mt-1">₹{restaurant.min_order}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Avg Time</p>
                            <p className="text-xs font-bold text-gray-900 mt-1">{restaurant.delivery_time} mins</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <MapPin size={14} className="text-red-300" /> {restaurant.address || 'Location Hidden'}
                        </div>
                        <button className="p-2 text-gray-400 hover:text-[#ff4b3a] hover:bg-red-50 rounded-xl transition-all">
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;
