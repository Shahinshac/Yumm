import React, { useState, useEffect } from 'react';
import { 
  Star, ChevronRight, SlidersHorizontal, ChevronDown,
  Bookmark, Tag, Percent
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
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

const RestaurantCard = ({ rest, onClick }) => {
  const ratingColor = rest.rating >= 4 ? 'bg-green-600' : 'bg-yellow-500';
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={rest.image || `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80&sig=${rest.id}`}
          alt={rest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => { e.target.src = `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
           <Bookmark size={16} />
        </div>

        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
           <div className="flex items-center gap-2">
              <div className={`${ratingColor} text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1`}>
                {rest.rating || '4.2'} <Star size={8} className="fill-white" />
              </div>
              <span className="text-white text-[9px] font-bold drop-shadow">25–35 mins</span>
           </div>
           {(rest.special_offer && rest.offer_active) && (
             <div className="bg-black/70 backdrop-blur px-2 py-0.5 rounded-md text-white text-[9px] font-black uppercase tracking-wide">
                {rest.special_offer}
             </div>
           )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-gray-900 text-base leading-tight truncate flex-1">{rest.name}</h3>
          <span className="text-gray-400 font-bold text-[10px] shrink-0 mt-0.5">₹{rest.min_order || 99}+</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-[10px] font-bold uppercase tracking-wide">
           <span>{rest.category || 'Casual Dining'}</span>
           <div className="w-1 h-1 bg-gray-200 rounded-full" />
           <span className="truncate">{rest.address?.split(',')[0] || 'Nearby'}</span>
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
    <div className="space-y-5 pb-24">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-[#e23744] h-36 sm:h-52 flex items-center px-5 shadow-xl shadow-red-100 group">
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
         </div>
         
         <div className="relative z-10 flex flex-col items-start gap-2">
            <h2 className="text-white text-2xl sm:text-5xl font-black italic tracking-tighter leading-none">
               ITEMS AT <br /> <span className="text-3xl sm:text-6xl">50% OFF</span>
            </h2>
            <button className="bg-black text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
               Order now <ChevronRight size={12} />
            </button>
         </div>

         <div className="absolute right-0 bottom-0 top-0 w-2/5 overflow-hidden hidden sm:block">
            <img 
               src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" 
               className="w-full h-full object-cover rotate-3 scale-110 opacity-80"
               alt="Hero"
            />
         </div>
      </div>

      {/* CATEGORY CAROUSEL */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
         {CATEGORIES.map(cat => (
           <button 
             key={cat.name}
             onClick={() => setActiveCategory(cat.name)}
             className="flex flex-col items-center gap-1.5 shrink-0 group"
           >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-sm border transition-all ${activeCategory === cat.name ? 'border-[#e23744] bg-[#fdf2f2] scale-105 shadow-md' : 'border-gray-100 bg-white'}`}>
                 {cat.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${activeCategory === cat.name ? 'text-[#e23744]' : 'text-gray-400'}`}>
                {cat.name}
              </span>
           </button>
         ))}
      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
         <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm shrink-0">
            <SlidersHorizontal size={11} /> Filters <ChevronDown size={11} />
         </button>
         <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm shrink-0">
            Under ₹200
         </button>
         <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm shrink-0">
            4.0+ ⭐
         </button>
         <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-700 hover:border-black transition shadow-sm shrink-0">
            <span className="flex items-center gap-1"><Percent size={10} /> Offers</span>
         </button>
      </div>

      {/* RESTAURANT FEED */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-gray-900">
            {filtered.length} Restaurants Near You
          </h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Delivering now</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 bg-gray-50 rounded-2xl">
            <span className="text-4xl mb-3">🍽️</span>
            <p className="text-gray-900 font-black text-base">No restaurants found</p>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Try disabling Veg Mode or changing filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
