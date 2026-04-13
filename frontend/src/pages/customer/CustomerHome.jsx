import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Clock, ChevronRight, Zap, Tag, TrendingUp,
  SlidersHorizontal, ChevronDown, Bookmark, Percent, Play, Train, LayoutGrid
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIES = [
  { name: 'All', icon: '🍽️' },
  { name: 'Biryani', icon: '🍛' },
  { name: 'Chicken', icon: '🍗' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Rice', icon: '🍚' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Dosa', icon: '🥞' },
];

const EXPLORE = [
  { name: 'Offers', icon: <Percent className="text-blue-600" />, bg: 'bg-blue-50' },
  { name: 'Play & win', icon: <Play className="text-orange-600" />, bg: 'bg-orange-50' },
  { name: 'Food on train', icon: <Train className="text-indigo-600" />, bg: 'bg-indigo-50' },
  { name: 'Collections', icon: <LayoutGrid className="text-pink-600" />, bg: 'bg-pink-50' },
];

const RestaurantCard = ({ rest, onClick }) => {
  const ratingColor = rest.rating >= 4 ? 'bg-green-600' : 'bg-yellow-500';
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group mb-6"
    >
      <div className="relative h-56 overflow-hidden rounded-[2rem]">
        <img
          src={rest.image || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80&sig=${rest.id}`}
          alt={rest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.src = `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
           <Bookmark size={20} />
        </div>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <div className={`${ratingColor} text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-lg`}>
                {rest.rating || '4.2'} <Star size={10} className="fill-white" />
              </div>
              <span className="text-white text-[10px] font-bold text-shadow">1.5 km • 25 mins</span>
           </div>
           {(rest.special_offer && rest.offer_active) && (
             <div className="bg-[#1c1c1c]/80 backdrop-blur px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest mt-1">
                {rest.special_offer}
             </div>
           )}
        </div>
      </div>

      <div className="py-4 px-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-lg tracking-tight truncate">{rest.name}</h3>
          <span className="text-gray-400 font-bold text-xs">₹{rest.min_order * 2 || '400'} for two</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
           <span>{rest.category || 'Casual Dining'}</span>
           <div className="w-1 h-1 bg-gray-200 rounded-full" />
           <span>{rest.address?.split(',')[0] || 'Nearby'}</span>
        </div>
      </div>
    </div>
  );
};

const CustomerHome = () => {
  const navigate = useNavigate();
  const { vegMode, locationName } = useOutletContext();
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await api.get('/customer/restaurants');
        const list = res.data || [];
        setRestaurants(list);
        applyFilters(list, 'All', vegMode);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const applyFilters = (list, category, isVeg) => {
    let result = [...list];
    if (category !== 'All') {
      result = result.filter(r => r.category === category || r.name.toLowerCase().includes(category.toLowerCase()));
    }
    if (isVeg) {
      result = result.filter(r => r.is_veg || r.category === 'Veg' || r.name.toLowerCase().includes('veg'));
    }
    setFiltered(result);
  };

  useEffect(() => {
    applyFilters(restaurants, activeCategory, vegMode);
  }, [vegMode, activeCategory, restaurants]);

  return (
    <div className="space-y-8 pb-24">
      
      {/* 50% OFF HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#e23744] h-48 md:h-72 flex items-center px-6 md:px-10 shadow-2xl shadow-red-100 group">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         </div>
         
         <div className="relative z-10 flex flex-col items-start gap-2 animate-in fade-in slide-in-from-left duration-700">
            <h2 className="text-white text-3xl md:text-6xl font-black italic tracking-tighter leading-none">
               ITEMS AT <br /> <span className="text-4xl md:text-7xl">50% OFF</span>
            </h2>
            <button className="bg-black text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
               Order now <ChevronRight size={14} />
            </button>
         </div>

         <div className="absolute right-0 bottom-0 top-0 w-1/2 overflow-hidden hidden md:block">
            <img 
               src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" 
               className="w-full h-full object-cover transform rotate-3 scale-110 opacity-90 group-hover:scale-100 transition-transform duration-[2s]"
               alt="Hero"
            />
         </div>
      </div>

      {/* CATEGORY CAROUSEL */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-1">
         {CATEGORIES.map(cat => (
           <button 
             key={cat.name}
             onClick={() => setActiveCategory(cat.name)}
             className="flex flex-col items-center gap-2 shrink-0 group"
           >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-sm border transition-all ${activeCategory === cat.name ? 'border-[#e23744] bg-[#fdf2f2] scale-105 shadow-md' : 'border-gray-100 bg-white group-hover:border-gray-200'}`}>
                 {cat.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${activeCategory === cat.name ? 'text-[#e23744]' : 'text-gray-500'}`}>
                {cat.name}
              </span>
           </button>
         ))}
      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
         <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm">
            <SlidersHorizontal size={12} /> Filters <ChevronDown size={12} />
         </button>
         <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm">
            Under ₹200
         </button>
         <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm">
            4.0+
         </button>
      </div>

      {/* EXPLORE MORE */}
      <div>
         <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Explore</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXPLORE.map(item => (
              <div key={item.name} className={`${item.bg} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-white/50 group`}>
                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:rotate-6 transition-transform">
                    {React.cloneElement(item.icon, { size: 16 })}
                 </div>
                 <span className="text-[10px] font-black text-gray-900 tracking-tight">{item.name}</span>
              </div>
            ))}
         </div>
      </div>

      {/* RESTAURANT FEED */}
      <div className="pt-8">
        <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-3">
          {filtered.length} RESTAURANTS DELIVERING TO YOU
        </h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-8 italic">Featured Selections</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 h-72 rounded-[2.5rem]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 bg-gray-50 rounded-[3rem]">
            <span className="text-5xl mb-4">🍽️</span>
            <p className="text-gray-900 font-black text-lg">No matches found</p>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Try disabling Veg Mode or changing filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
            {filtered.map(rest => (
              <RestaurantCard 
                key={rest.id} 
                rest={rest} 
                onClick={() => navigate(`/restaurant/${rest.id}`)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHome;
