import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit3, Trash2, CheckCircle2, XCircle, Loader2, UtensilsCrossed } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    restaurantService.getMenu()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'veg' ? item.is_veg : !item.is_veg);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading your menu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove items from your public menu.</p>
        </div>
        <button className="bg-[#ff4b3a] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 flex items-center justify-center gap-2">
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'veg', 'non-veg'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your menu is empty</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start by adding your first dish for customers to order.</p>
          <button className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-gray-200">
            Create First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur bg-white/90 ${item.is_available ? 'text-green-600' : 'text-red-500'}`}>
                    {item.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900 truncate">{item.name}</h3>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-4">{item.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xl font-black text-gray-900">₹{item.price}</span>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"><Edit3 size={16} /></button>
                    <button className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
