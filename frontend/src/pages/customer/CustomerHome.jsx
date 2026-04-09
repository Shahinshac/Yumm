import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, ChevronRight, Zap, Tag, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIES = [
  { label: 'Biryani', emoji: '🍛' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Burgers', emoji: '🍔' },
  { label: 'Sushi', emoji: '🍱' },
  { label: 'Desserts', emoji: '🍰' },
  { label: 'Healthy', emoji: '🥗' },
  { label: 'Chinese', emoji: '🥡' },
  { label: 'Tandoori', emoji: '🍗' },
];

const BANNERS = [
  { title: '50% OFF', sub: 'On your first order', bg: 'from-orange-500 to-red-500', emoji: '🎉' },
  { title: 'Free Delivery', sub: 'Orders above ₹299', bg: 'from-green-500 to-teal-500', emoji: '🛵' },
  { title: 'New Arrivals', sub: 'Fresh restaurants near you', bg: 'from-purple-500 to-indigo-500', emoji: '✨' },
];

const RestaurantCard = ({ rest }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
    <div className="relative h-44 overflow-hidden">
      <img
        src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80&sig=${rest.id}`}
        alt={rest.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Badges */}
      <div className="absolute top-3 left-3 flex gap-2">
        {rest.promoted && (
          <span className="bg-[#ff4b3a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Promoted
          </span>
        )}
        {rest.distance_km !== undefined && rest.distance_km !== null && (
          <span className="bg-white/90 backdrop-blur text-gray-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-gray-100">
            <MapPin size={10} className="text-[#ff4b3a] fill-[#ff4b3a]/20" /> {rest.distance_km} KM
          </span>
        )}
      </div>
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
        <Star size={12} className="text-yellow-500 fill-yellow-500" />
        <span className="font-bold text-xs text-gray-800">{rest.rating || '4.5'}</span>
      </div>
      {rest.offer && (
        <div className="absolute bottom-3 left-3 bg-[#ff4b3a] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
          {rest.offer}
        </div>
      )}
    </div>

    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-900 text-base truncate">{rest.name}</h3>
      </div>
      <p className="text-gray-500 text-sm truncate mt-0.5">{rest.category || 'Multi-cuisine'}</p>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <Clock size={13} />
          <span>{rest.delivery_time || 30} mins</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin size={13} />
          <span className="truncate max-w-[100px]">{rest.address || 'Nearby'}</span>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          ₹{rest.min_order || 149} min
        </div>
      </div>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded-full w-full mt-4" />
    </div>
  </div>
);

const CustomerHome = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const [coords, setCoords] = useState(null);

  // Geolocation watch
  useEffect(() => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
      },
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const params = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
        const res = await api.get(`/customer/restaurants${params}`);
        const list = res.data || [];
        setRestaurants(list);
        setFiltered(list);
      } catch (error) {
        console.error("Fetch restaurants error:", error);
        setRestaurants([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [coords]);

  // Banner auto-rotate
  useEffect(() => {
    const t = setInterval(() => setActiveBanner(b => (b + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Filter logic
  useEffect(() => {
    let list = [...restaurants];
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.category || '').toLowerCase().includes(search.toLowerCase()));
    if (activeCategory) list = list.filter(r => (r.category || '').toLowerCase().includes(activeCategory.toLowerCase()));
    setFiltered(list);
  }, [search, activeCategory, restaurants]);

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'there';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            Hey {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">What are you craving today?</p>
        </div>
        {coords && (
          <div className="bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Live Proximity Active</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden focus-within:border-[#ff4b3a] focus-within:shadow-md transition-all duration-200">
        <div className="flex-1 flex items-center px-5 gap-3">
          <Search className="text-gray-400 shrink-0" size={20} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="w-full py-4 outline-none text-gray-800 placeholder-gray-400 bg-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2 px-5 border-l border-gray-200 text-gray-500 text-sm shrink-0">
          <MapPin size={16} className="text-[#ff4b3a]" />
          <span className="font-medium hidden sm:inline">{coords ? 'Current Location' : 'Malappuram'}</span>
        </div>
      </div>

      {/* Promo Banners */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-red-50">
        {BANNERS.map((b, i) => (
          <div
            key={i}
            className={`bg-gradient-to-r ${b.bg} text-white p-7 flex items-center justify-between transition-all duration-500 ${i === activeBanner ? 'block' : 'hidden'}`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <Zap size={12} />
                Limited Time
              </div>
              <h2 className="text-3xl font-black">{b.title}</h2>
              <p className="text-white/80 mt-1">{b.sub}</p>
              <button className="mt-4 bg-white text-gray-800 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 transition inline-flex items-center gap-1 active:scale-95 shadow-lg">
                Order Now <ChevronRight size={14} />
              </button>
            </div>
            <div className="text-7xl hidden sm:block">{b.emoji}</div>
          </div>
        ))}
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === activeBanner ? 'bg-white w-5' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Tag size={18} className="text-[#ff4b3a]" /> Order by category
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('')}
            className={`flex flex-col items-center gap-2 shrink-0 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
              activeCategory === '' ? 'border-[#ff4b3a] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs font-semibold text-gray-700">All</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? '' : cat.label)}
              className={`flex flex-col items-center gap-2 shrink-0 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
                activeCategory === cat.label ? 'border-[#ff4b3a] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#ff4b3a]" />
            {activeCategory ? `${activeCategory} Restaurants` : coords ? 'Nearest Restaurants for you' : 'Top picks near you'}
          </h2>
          <span className="text-sm text-gray-400 font-medium">{filtered.length} options</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4">🔍</span>
            <p className="font-semibold text-lg text-gray-900 text-center">No restaurants found nearby</p>
            <p className="text-sm text-center">Be the first to onboard a restaurant in this area!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(rest => <RestaurantCard key={rest.id} rest={rest} />)}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerHome;
