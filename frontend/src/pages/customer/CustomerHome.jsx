import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import api from '../../services/api';

const CustomerHome = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming backend has a generic GET /restaurants or similar list endpoint
    // If not, this is a clean mock representing the structure
    api.get('/restaurants').then(res => {
      setRestaurants(res.data.restaurants || []);
    }).catch(() => {
      // Fallback stub for display
      setRestaurants([
        { _id: '1', name: 'Pizza Paradise', rating: 4.8, category: 'Italian', time: '20-30 min' },
        { _id: '2', name: 'Burger Joint', rating: 4.5, category: 'American', time: '15-25 min' },
        { _id: '3', name: 'Sushi Bliss', rating: 4.9, category: 'Japanese', time: '30-45 min' }
      ]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#ff4b3a] rounded-2xl p-8 text-white flex flex-col justify-center min-h-[200px] shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Feeling Hungry?</h1>
          <p className="text-orange-100 max-w-sm">Discover the best food & drinks in your area, delivered directly to your door.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex-1 flex items-center px-4 border-r">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for restaurants or dishes..." 
            className="w-full pl-3 outline-none py-2"
          />
        </div>
        <div className="flex items-center px-4 w-48 text-gray-500 text-sm font-medium">
          <MapPin size={18} className="mr-2 text-[#ff4b3a]" />
          Current Location
        </div>
      </div>

      {/* Restaurant Layout */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top Rated Near You</h2>
        {loading ? (
          <div className="text-gray-500">Loading restaurants...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(rest => (
              <div key={rest._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group">
                <div className="h-40 bg-gray-200 w-full relative">
                  {/* Generic placeholder image */}
                  <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80" alt="Restaurant" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold shadow">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" /> {rest.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">{rest.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                    <span>{rest.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {rest.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Clock icon for demo 
import { Clock } from 'lucide-react';

export default CustomerHome;
