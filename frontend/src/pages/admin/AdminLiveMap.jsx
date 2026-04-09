import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Map as MapIcon, Users, Navigation, Shield, Info, Loader2, Search, Filter } from 'lucide-react';

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

const AdminLiveMap = () => {
    const [socket, setSocket] = useState(null);
    const [drivers, setDrivers] = useState({});
    const [stats, setStats] = useState({ online: 0, busy: 0 });
    const [loading, setLoading] = useState(true);

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
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{stats.online} Available</span>
                    </div>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{stats.busy} On Trip</span>
                    </div>
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
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#ff4b3a] transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl max-h-96 overflow-y-auto scrollbar-hide">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff4b3a] mb-4">Active Partners ({Object.keys(drivers).length})</h3>
                        <div className="space-y-4">
                            {Object.values(drivers).length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No partners currently online.</p>
                            ) : (
                                Object.values(drivers).map(driver => (
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
                    className="h-full w-full grayscale-[0.2] contrast-[1.1]"
                    zoomControl={false}
                    style={{ minHeight: '500px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {Object.values(drivers).map(driver => (
                        <Marker 
                            key={driver.user_id} 
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
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminLiveMap;
