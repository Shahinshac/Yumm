import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Activity, Search, Bike, Store, Users, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../services/api';

// Fix default leaflet icon issue in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker factories
const makeIcon = (color, emoji) => L.divIcon({
  html: `<div style="
    background:${color};
    width:36px;height:36px;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
  ">${emoji}</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const RESTAURANT_ICON  = makeIcon('#f97316', '🍽️');
const DRIVER_ICON_ON   = makeIcon('#22c55e', '🛵');
const DRIVER_ICON_OFF  = makeIcon('#94a3b8', '🛵');

// India center fallback
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM   = 5;

const AdminLiveMap = () => {
  const [hotels,   setHotels]   = useState([]);
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [search,   setSearch]   = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/global-map-data');
      const data = res.data;
      // Filter only items that have valid coordinates
      const validHotels = (data.hotels || []).filter(
        h => h.location && typeof h.location.lat === 'number' && typeof h.location.lng === 'number'
      );
      const validDrivers = (data.drivers || []).filter(
        d => d.location && typeof d.location.lat === 'number' && typeof d.location.lng === 'number'
      );
      setHotels(validHotels);
      setDrivers(validDrivers);
      setLastSync(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.error('Map fetch error:', err);
      setError('Could not load map data. The backend may not have any location data yet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredDrivers = drivers.filter(d =>
    !search || (d.username || '').toLowerCase().includes(search.toLowerCase())
  );
  const filteredHotels = hotels.filter(h =>
    !search || (h.name || '').toLowerCase().includes(search.toLowerCase())
  );

  // Compute a map center from available pins
  const allPins = [
    ...filteredHotels.map(h => [h.location.lat, h.location.lng]),
    ...filteredDrivers.map(d => [d.location.lat, d.location.lng]),
  ];
  const mapCenter = allPins.length > 0 ? allPins[0] : DEFAULT_CENTER;
  const mapZoom   = allPins.length > 0 ? 11 : DEFAULT_ZOOM;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Live Map</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {lastSync ? `Last synced: ${lastSync}` : 'Real-time view of restaurants & delivery partners'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff4b3a] text-white rounded-xl font-bold text-sm hover:bg-red-600 disabled:opacity-50 transition"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Store size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Restaurants</p>
            <p className="text-xl font-black text-gray-900">{hotels.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <Bike size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Riders</p>
            <p className="text-xl font-black text-gray-900">{drivers.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <Activity size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Online</p>
            <p className="text-xl font-black text-gray-900">
              {drivers.filter(d => d.status === 'online').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search restaurants or riders on map…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:border-[#ff4b3a] outline-none"
        />
      </div>

      {/* Error notice */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 h-[520px]">
        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
          {loading && (
            <div className="absolute inset-0 z-[2000] bg-white/80 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#ff4b3a]" size={32} />
            </div>
          )}
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {filteredHotels.map(h => (
              <Marker key={h.id} position={[h.location.lat, h.location.lng]} icon={RESTAURANT_ICON}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm">{h.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{h.address || 'No address'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Restaurant
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
            {filteredDrivers.map(d => (
              <Marker
                key={d.user_id || d.id}
                position={[d.location.lat, d.location.lng]}
                icon={d.status === 'online' ? DRIVER_ICON_ON : DRIVER_ICON_OFF}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm">{d.username || 'Rider'}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      d.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {d.status || 'offline'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-xl p-3 shadow-md border border-gray-100 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <span className="text-base">🍽️</span> Restaurant
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <span className="text-base" style={{filter:'hue-rotate(120deg)'}}>🛵</span> Active Rider
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="text-base opacity-50">🛵</span> Offline Rider
            </div>
          </div>
        </div>

        {/* Sidebar list */}
        <div className="lg:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {filteredHotels.length + filteredDrivers.length} pins on map
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredHotels.map(h => (
              <div key={h.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm shrink-0">🍽️</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{h.name}</p>
                  <p className="text-xs text-gray-400 truncate">{h.address || '—'}</p>
                </div>
              </div>
            ))}
            {filteredDrivers.map(d => (
              <div key={d.user_id || d.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${d.status === 'online' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  🛵
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{d.username || 'Rider'}</p>
                  <p className={`text-xs font-bold uppercase ${d.status === 'online' ? 'text-green-500' : 'text-gray-400'}`}>
                    {d.status || 'offline'}
                  </p>
                </div>
              </div>
            ))}
            {filteredHotels.length === 0 && filteredDrivers.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Store size={32} className="mb-2" />
                <p className="text-xs font-bold text-center px-4">
                  No location data yet. Locations appear when restaurants and riders are active.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveMap;
