import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Map as MapIcon, Users, Navigation, Shield, Info, Loader2, Search, Filter, Home, User } from 'lucide-react';
import { adminService } from '../../services/adminService';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

const DeliveryIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-[#ff4b3a] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const HotelIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-blue-600 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const CustomerIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const AdminLiveMap = () => {
    const [socket, setSocket] = useState(null);
    const [drivers, setDrivers] = useState({});
    const [hotels, setHotels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({ online: 0, busy: 0 });
    const [heatmapVisible, setHeatmapVisible] = useState(false);
    const [visibility, setVisibility] = useState({ drivers: true, hotels: true, customers: true });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                const data = await adminService.getGlobalMapData();
                if (data.success) {
                    setHotels(data.hotels || []);
                    setCustomers(data.customers || []);
                }
            } catch (err) {
                console.error('❌ Failed to fetch global map data:', err);
                setHotels([]);
                setCustomers([]);
            }
        };

        fetchGlobalData();
        const interval = setInterval(fetchGlobalData, 30000); // Refresh hotels/customers every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Connect to Socket.IO
        // Use a more robust URL resolution
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin.replace('3000', '5000');
        const newSocket = io(apiUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            timeout: 10000
        });
        
        setSocket(newSocket);

        const connectionTimer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 3000); // Fail-safe to show map even if socket stalls

        newSocket.on('connect', () => {
            console.log('🔌 Connected to Fleet Hub');
            newSocket.emit('join_fleet_room', {});
            setLoading(false);
            clearTimeout(connectionTimer);
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket connection error:', err);
            setLoading(false); // Show map even with error
        });

        newSocket.on('fleet_location_update', (data) => {
            setDrivers(prev => ({
                ...prev,
                [data.user_id]: {
                    ...data,
                    lastSeen: new Date().toLocaleTimeString()
                }
            }));
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        const driversList = Object.values(drivers);
        const online = driversList.filter(d => d.status === 'online').length;
        const busy = driversList.filter(d => d.status === 'busy').length;
        setStats({ online, busy });
    }, [drivers]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#ff4b3a] mb-4" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Initialising Global Fleet Map...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <MapIcon className="text-[#ff4b3a]" size={28} /> Global Fleet Monitor
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Real-time live location tracking of all active delivery partners.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{stats.busy} On Trip</span>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                        <button 
                            onClick={() => setVisibility(v => ({...v, drivers: !v.drivers}))}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${visibility.drivers ? 'bg-[#ff4b3a] text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Navigation size={14} /> <span className="text-[10px] font-black uppercase">Drivers</span>
                        </button>
                        <button 
                            onClick={() => setVisibility(v => ({...v, hotels: !v.hotels}))}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${visibility.hotels ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Home size={14} /> <span className="text-[10px] font-black uppercase">Hotels</span>
                        </button>
                        <button 
                            onClick={() => setVisibility(v => ({...v, customers: !v.customers}))}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${visibility.customers ? 'bg-green-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <User size={14} /> <span className="text-[10px] font-black uppercase">Customers</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => setHeatmapVisible(!heatmapVisible)}
                        className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                            heatmapVisible 
                            ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-200' 
                            : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:bg-gray-50'
                        }`}
                    >
                        {heatmapVisible ? '🔥 Heatmap: ON' : '📊 Heatmap: OFF'}
                    </button>
                </div>
            </div>

            <div className="flex-1 rounded-[3rem] border-8 border-white bg-gray-100 shadow-2xl overflow-hidden relative group">
                {/* Overlay UI */}
                <div className="absolute top-6 left-6 z-[1000] w-72 space-y-4">
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search driver ID..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#ff4b3a] transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl max-h-96 overflow-y-auto scrollbar-hide">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff4b3a] mb-4">Active Partners ({Object.keys(drivers).length})</h3>
                        <div className="space-y-4">
                            {Object.values(drivers).filter(d => (d.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.user_id || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No partners match your search.</p>
                            ) : (
                                Object.values(drivers)
                                  .filter(d => (d.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.user_id || '').toLowerCase().includes(searchTerm.toLowerCase()))
                                  .map(driver => (
                                    <div key={driver.user_id} className="flex items-center justify-between group/item cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ${driver.status === 'online' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                {driver.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{driver.username}</p>
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Seen {driver.lastSeen}</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover/item:text-[#ff4b3a] transition-colors">
                                            <Navigation size={14} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 z-[1000]">
                    <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-4 max-w-sm">
                         <div className="p-3 bg-red-500 rounded-2xl">
                            <Shield size={24} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">System Alert</p>
                            <p className="text-xs font-medium leading-relaxed mt-1">Global tracking active. All location updates are secured via encrypted socket tunnels.</p>
                         </div>
                    </div>
                </div>

                <MapContainer 
                    center={[20.5937, 78.9629]} // Center of India
                    zoom={5} 
                    className="h-full w-full"
                    zoomControl={false}
                    style={{ minHeight: '500px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.basemaps.cartocdn.com/copyright">CartoDB</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    
                    {/* Render Drivers */}
                    {visibility.drivers && Object.values(drivers).map(driver => (
                        <React.Fragment key={driver.user_id}>
                            <Marker 
                                position={[driver.lat, driver.lng]} 
                                icon={DeliveryIcon}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-2">
                                        <p className="font-black text-gray-900 text-sm">Partner: {driver.username}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Status: {driver.status}</p>
                                    </div>
                                </Popup>
                            </Marker>
                            {heatmapVisible && (
                                <Circle 
                                    center={[driver.lat, driver.lng]}
                                    radius={2000} // 2km hotspot
                                    pathOptions={{ 
                                        fillColor: '#ff4b3a', 
                                        color: '#ff4b3a', 
                                        weight: 0,
                                        fillOpacity: 0.15 
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Render Hotels */}
                    {visibility.hotels && hotels.map(hotel => (
                        <Marker 
                            key={hotel.id}
                            position={[hotel.location.lat, hotel.location.lng]}
                            icon={HotelIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2">
                                    <p className="font-black text-gray-900 text-sm">{hotel.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Licensed Restaurant</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Render Active Customers */}
                    {visibility.customers && customers.map(customer => (
                        <Marker 
                            key={customer.id}
                            position={[customer.location.lat, customer.location.lng]}
                            icon={CustomerIcon}
                        >
                            <Popup className="custom-popup">
                                <div className="p-2">
                                    <p className="font-black text-gray-900 text-sm">{customer.username}</p>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Order Status: {customer.status}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminLiveMap;
