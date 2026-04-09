import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Navigation, Package, MapPin, Phone, MessageSquare, ChevronLeft, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { customerService } from '../../services/customerService';
import ChatModule from '../../components/ChatModule';

const DriverIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-[#ff4b3a] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const DestinationIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-gray-900 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M10 21V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v13"/><path d="M18 21V10a2 2 0 0 0-2-2h-1"/><path d="M6 21V10a2 2 0 0 1 2-2h1"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// Component to auto-resize map to fit both points
const MapAutoFit = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
};

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await customerService.getOrderDetails(orderId);
                setOrder(data);
                if (data.current_location) {
                    setDriverLocation(data.current_location);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔌 Tracking established');
            newSocket.emit('join_order_room', { order_id: orderId });
        });

        newSocket.on('delivery_location_update', (data) => {
            if (data.order_id === orderId) {
                setDriverLocation({ lat: data.lat, lng: data.lng });
            }
        });

        newSocket.on('order_status_update', (data) => {
            if (data.order_id === orderId) {
                setOrder(prev => ({ ...prev, status: data.status }));
            }
        });

        return () => newSocket.disconnect();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#ff4b3a] mb-4" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Initialising Live Tracking...</p>
            </div>
        );
    }

    const destLocation = order?.destination_coords || [0, 0]; 
    const points = driverLocation ? [[driverLocation.lat, driverLocation.lng], destLocation] : [destLocation];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="mb-8">
                <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-[#ff4b3a] transition-all font-bold text-sm">
                    <ChevronLeft size={20} /> Back to My Orders
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Track Your Meal</h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Live progress of order #{orderId.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
                        <Clock className="text-[#ff4b3a]" size={20} />
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Estimated Arrival</p>
                            <p className="text-sm font-black text-[#ff4b3a] mt-1">15 - 20 Mins</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map View */}
                <div className="lg:col-span-2 rounded-[3.5rem] bg-gray-100 border-8 border-white shadow-2xl h-[500px] overflow-hidden relative group">
                    <MapContainer 
                        center={destLocation} 
                        zoom={13} 
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.basemaps.cartocdn.com/copyright">CartoDB</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={destLocation} icon={DestinationIcon}>
                            <Popup>Your Delivery Location</Popup>
                        </Marker>
                        {driverLocation && (
                            <>
                                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={DriverIcon}>
                                    <Popup>Your Delivery Partner</Popup>
                                </Marker>
                                <Polyline positions={points} color="#ff4b3a" weight={4} dashArray="10, 10" opacity={0.6} />
                                <MapAutoFit points={points} />
                            </>
                        )}
                    </MapContainer>
                    
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur shadow-xl p-4 rounded-3xl border border-white z-[1000] flex items-center gap-3">
                         <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                         <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Live Updates Active</span>
                    </div>
                </div>

                {/* Status Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff4b3a] mb-6">Delivery Details</h3>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400">
                                    <Navigation size={32} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-lg">{order?.delivery_partner_name || 'Assigning Partner...'}</p>
                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                                        <ShieldCheck size={14} className="text-green-500" /> Verified Delivery Hero
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                                    <Phone size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Call</span>
                                </button>
                                <button 
                                    onClick={() => setShowChat(true)}
                                    className="flex-1 py-4 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <MessageSquare size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {showChat && (
                        <ChatModule 
                            orderId={orderId} 
                            socket={socket} 
                            onClose={() => setShowChat(false)} 
                        />
                    )}

                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff4b3a] mb-8">Order Status</h3>
                        <div className="space-y-8 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gray-100" />
                            
                            {[
                                { status: 'placed', label: 'Order Placed', time: '12:30 PM' },
                                { status: 'accepted', label: 'Restaurant Accepted', time: '12:32 PM' },
                                { status: 'picked', label: 'Food Picked Up', time: '12:45 PM' },
                                { status: 'delivered', label: 'Delivered', time: '--:--' }
                            ].map((step, idx) => (
                                <div key={step.status} className={`flex items-start gap-6 relative z-10 ${order.status === step.status ? 'opacity-100' : 'opacity-40'}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-md ${
                                        order.status === step.status ? 'bg-[#ff4b3a] text-white' : 'bg-gray-200 text-gray-400'
                                    }`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 leading-none">{step.label}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
