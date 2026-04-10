import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { 
    Map as MapIcon, Navigation, Navigation2, Shield, Loader2, Search, 
    Home, User, Bike, Activity, Bell, MapPin, 
    ChevronRight, ExternalLink, RefreshCw, Play
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import useMarkerAnimation from '../../hooks/useMarkerAnimation';

// --- CUSTOM MARKERS (Zomato/Swiggy Style SVG) ---

const CreateCustomIcon = (type, color) => L.divIcon({
    html: `
        <div class="relative group">
            <div class="w-10 h-10 rounded-2xl bg-white shadow-xl flex items-center justify-center border-2 border-${color}-500 transition-all duration-300 group-hover:scale-110">
                <div class="w-8 h-8 rounded-xl bg-${color}-500 flex items-center justify-center text-white">
                    ${type === 'driver' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M18.5 17a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 15h3.5l3-3.5L17 5H7l-3 6.5H12v3.5Z"/></svg>' : ''}
                    ${type === 'hotel' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' : ''}
                    ${type === 'customer' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' : ''}
                </div>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-${color}-500 rotate-45 shadow-sm"></div>
        </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

// Component for a moving marker with interpolation
const AnimatedDriverMarker = ({ driver }) => {
    const animatedPosition = useMarkerAnimation([driver.lat, driver.lng], 1000);
    const icon = useMemo(() => CreateCustomIcon('driver', driver.status === 'online' ? 'green' : 'orange'), [driver.status]);

    return (
        <Marker position={animatedPosition} icon={icon}>
            <Popup className="premium-popup">
                <div className="p-3 w-48">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${driver.status === 'online' ? 'bg-green-500' : 'bg-orange-500'}`}>
                            {driver.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 leading-tight">{driver.username}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{driver.status}</p>
                        </div>
                    </div>
                    <div className="space-y-2 border-t border-gray-100 pt-2">
                         <p className="text-[10px] flex items-center justify-between">
                            <span className="text-gray-400 font-bold uppercase">Last Active</span>
                            <span className="font-black text-gray-700">{driver.lastSeen || 'Just now'}</span>
                         </p>
                         <button className="w-full py-2 bg-gray-50 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-50 hover:text-orange-600 transition">
                            View Logistics
                         </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

// Map auto-fit component
const RecenterMap = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [points, map]);
    return null;
};

const AdminLiveMap = () => {
    const [socket, setSocket] = useState(null);
    const [drivers, setDrivers] = useState({});
    const [hotels, setHotels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSimulating, setIsSimulating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const simIntervalRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                const data = await adminService.getGlobalMapData();
                if (data.success) {
                    setHotels(data.hotels || []);
                    setCustomers(data.customers || []);
                    const initialDrivers = {};
                    (data.drivers || []).forEach(d => {
                        initialDrivers[d.user_id] = { ...d, lat: d.location.lat, lng: d.location.lng, lastSeen: 'synced' };
                    });
                    setDrivers(initialDrivers);
                }
            } catch (err) {
                console.error('❌ Data fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalData();
    }, []);

    // Socket Setup
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('3000', '5000');
        const newSocket = io(apiUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_fleet_room', {});
            addFeedEvent('Connected to Global Fleet Hub', 'system');
        });

        newSocket.on('fleet_location_update', (data) => {
            setDrivers(prev => ({
                ...prev,
                [data.user_id]: { ...data, lastSeen: new Date().toLocaleTimeString() }
            }));
            if (!drivers[data.user_id]) addFeedEvent(`${data.username || 'Partner'} joined the hub`, 'join');
        });

        return () => newSocket.disconnect();
    }, []);

    // Simulation Logic
    useEffect(() => {
        if (isSimulating) {
            addFeedEvent("Simulation engines started. Generating mock telemetry.", "system");
            simIntervalRef.current = setInterval(() => {
                setDrivers(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(id => {
                        // Drift coordinates slightly
                        next[id] = {
                            ...next[id],
                            lat: next[id].lat + (Math.random() - 0.5) * 0.002,
                            lng: next[id].lng + (Math.random() - 0.5) * 0.002,
                            lastSeen: 'Simulating'
                        };
                    });
                    return next;
                });
            }, 3000);
        } else {
            clearInterval(simIntervalRef.current);
        }
        return () => clearInterval(simIntervalRef.current);
    }, [isSimulating]);

    const addFeedEvent = (msg, type) => {
        setFeed(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Satellite Command Center...</p>
            </div>
        );
    }

    const allPositions = [
        ...Object.values(drivers).map(d => [d.lat, d.lng]),
        ...hotels.map(h => [h.location.lat, h.location.lng])
    ];

    return (
        <div className="h-[calc(100vh-120px)] flex bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl overflow-hidden">
            
            {/* --- LEFT SIDEBAR (LIVE FEED) --- */}
            <div className="w-80 flex flex-col border-r border-gray-50 bg-gray-50/30">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                           <Activity size={20} className="text-orange-500" /> Live Feed
                        </h2>
                        <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input 
                            placeholder="Find partner..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs font-bold border-none focus:ring-1 focus:ring-orange-500 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
                    {feed.map(event => (
                        <div key={event.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-left duration-300">
                             <div className="flex items-center justify-between mb-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${
                                    event.type === 'system' ? 'text-blue-500' :
                                    event.type === 'join' ? 'text-green-500' : 'text-gray-400'
                                }`}>
                                   {event.type}
                                </span>
                                <span className="text-[8px] text-gray-300 font-bold">{event.time}</span>
                             </div>
                             <p className="text-[11px] font-bold text-gray-700 leading-snug">{event.msg}</p>
                        </div>
                    ))}
                    {feed.length === 0 && (
                        <div className="text-center py-20 opacity-20">
                            <Bell size={40} className="mx-auto mb-2" />
                            <p className="text-xs font-black uppercase">Monitoring signals...</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <button 
                        onClick={() => setIsSimulating(!isSimulating)}
                        className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isSimulating ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                        {isSimulating ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                        {isSimulating ? 'SIMULATION ACTIVE' : 'RUN SIMULATION'}
                    </button>
                    <p className="text-[9px] text-gray-400 text-center mt-3 font-bold">Protocol v4.2 · Secure Connection</p>
                </div>
            </div>

            {/* --- RIGHT SIDE (MAP) --- */}
            <div className="flex-1 relative bg-gray-50">
                {/* Float Controls */}
                <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white flex flex-col gap-1">
                        <div className="p-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Stats</p>
                            <div className="flex gap-6 mt-2">
                                <div>
                                    <p className="text-xl font-black text-gray-900">{Object.keys(drivers).length}</p>
                                    <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Active Pilots</p>
                                </div>
                                <div className="border-l border-gray-100 pl-6">
                                    <p className="text-xl font-black text-gray-900">{hotels.length}</p>
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Partner Hotels</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <MapContainer 
                    center={[20.5937, 78.9629]} 
                    zoom={5} 
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.basemaps.cartocdn.com/copyright">CartoDB</a>'
                    />
                    
                    {/* Elements */}
                    {Object.values(drivers)
                        .filter(d => d.username?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(d => <AnimatedDriverMarker key={d.user_id} driver={d} />)
                    }

                    {hotels.map(h => (
                        <Marker key={h.id} position={[h.location.lat, h.location.lng]} icon={CreateCustomIcon('hotel', 'blue')}>
                            <Popup className="premium-popup">
                                <p className="font-bold text-sm">{h.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">{h.address}</p>
                            </Popup>
                        </Marker>
                    ))}

                    {customers.map(c => (
                        <Marker key={c.id} position={[c.location.lat, c.location.lng]} icon={CreateCustomIcon('customer', 'green')}>
                            <Popup className="premium-popup">
                                <p className="font-bold text-sm">{c.username}</p>
                                <p className="text-[10px] text-green-500 uppercase font-bold">Active Customer</p>
                            </Popup>
                        </Marker>
                    ))}

                    <RecenterMap points={allPositions} />
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminLiveMap;
