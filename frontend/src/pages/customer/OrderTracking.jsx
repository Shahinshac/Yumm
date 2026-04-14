import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Navigation, Package, MapPin, Phone, MessageSquare, ChevronLeft, Loader2, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { formatIndianTime } from '../../utils/dateUtils';
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

// Status pipeline with ordering
const STATUS_PIPELINE = [
    { key: 'placed',    label: 'Order Placed',         icon: '📋' },
    { key: 'accepted',  label: 'Restaurant Accepted',   icon: '✅' },
    { key: 'preparing', label: 'Being Prepared',        icon: '👨‍🍳' },
    { key: 'ready',     label: 'Ready for Pickup',      icon: '📦' },
    { key: 'assigned',  label: 'Rider Assigned',        icon: '🛵' },
    { key: 'picked',    label: 'Food Picked Up',        icon: '🚀' },
    { key: 'delivered', label: 'Delivered!',            icon: '🎉' },
];

const CANCELLED_PIPELINE = [
    { key: 'placed',    label: 'Order Placed',  icon: '📋' },
    { key: 'cancelled', label: 'Cancelled',     icon: '❌' },
];

const isValidLocation = (value) => {
    return value && typeof value.lat === 'number' && typeof value.lng === 'number';
};

const normalizeLocation = (value) => {
    if (!value) return null;
    const lat = Number(value.lat);
    const lng = Number(value.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

const OrderTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchOrder = async () => {
            try {
                const data = await customerService.getOrderDetails(orderId);
                if (!isMounted) return;
                setOrder(data);
                setDriverLocation(normalizeLocation(data.current_location));
                setError('');
            } catch (err) {
                console.error(err);
                if (!isMounted) return;
                setError(err.response?.data?.error || 'Unable to load tracking data.');
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        fetchOrder();
        // Poll every 15 seconds for fresh status
        const poll = setInterval(fetchOrder, 15000);

        let newSocket;
        try {
            newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('🔌 Tracking established');
                newSocket.emit('join_order_room', { order_id: orderId });
            });

            newSocket.on('delivery_location_update', (data) => {
                if (data.order_id === orderId) {
                    const normalized = normalizeLocation(data);
                    if (normalized) setDriverLocation(normalized);
                }
            });

            newSocket.on('order_status_update', (data) => {
                if (data.order_id === orderId) {
                    setOrder(prev => prev ? ({ ...prev, status: data.status }) : prev);
                }
            });

            newSocket.on('connect_error', (err) => {
                console.warn('Socket connect error:', err);
                setError('Live tracking connection failed. Showing latest available data.');
            });
        } catch (err) {
            console.error('Socket initialization failed:', err);
            setError('Live tracking is unavailable right now.');
        }

        return () => {
            isMounted = false;
            clearInterval(poll);
            if (newSocket && newSocket.disconnect) {
                newSocket.disconnect();
            }
        };
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#ff4b3a] mb-4" />
                <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Initialising Live Tracking...</p>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                <div className="w-24 h-24 bg-yellow-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <ShieldCheck className="text-[#ffb000]" size={40} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Tracking Unavailable</h1>
                <p className="text-gray-500 font-medium max-w-sm mb-10 leading-relaxed">
                    {error}
                </p>
                <Link to="/orders" className="bg-[#1c1c1c] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                    Back to My Orders
                </Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <Package className="text-red-500" size={40} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Order Details Not Found</h1>
                <p className="text-gray-500 font-medium max-w-sm mb-10 leading-relaxed">
                    We couldn't retrieve the tracking information for this order. It might be delayed or the link might be incorrect.
                </p>
                <Link to="/orders" className="bg-[#1c1c1c] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                    Back to My Orders
                </Link>
            </div>
        );
    }

    const pipeline = order.status === 'cancelled' ? CANCELLED_PIPELINE : STATUS_PIPELINE;
    const currentIdx = pipeline.findIndex(s => s.key === order.status);

    const defaultLocation = [12.9716, 77.5946];
    const restaurantLocation = normalizeLocation(order?.restaurant_location);
    const destLocation = restaurantLocation ? [restaurantLocation.lat, restaurantLocation.lng] : defaultLocation;
    const points = driverLocation ? [[driverLocation.lat, driverLocation.lng], destLocation] : [destLocation];

    const formatTime = (isoStr) => {
        if (!isoStr) return '--:--';
        return formatIndianTime(isoStr);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            <div className="mb-8">
                <Link to="/orders" className="flex items-center gap-2 text-gray-400 hover:text-[#ff4b3a] transition-all font-bold text-sm">
                    <ChevronLeft size={20} /> Back to My Orders
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Track Your Meal</h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Live progress of order #{orderId.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${
                        order.status === 'delivered' ? 'bg-green-50 border-green-100' :
                        order.status === 'cancelled' ? 'bg-red-50 border-red-100' :
                        'bg-red-50 border-red-100'
                    }`}>
                        <Clock className={order.status === 'delivered' ? 'text-green-500' : 'text-[#ff4b3a]'} size={20} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none text-gray-400">Status</p>
                            <p className={`text-sm font-black mt-1 capitalize ${
                                order.status === 'delivered' ? 'text-green-600' :
                                order.status === 'cancelled' ? 'text-red-600' :
                                'text-[#ff4b3a]'
                            }`}>{order.status}</p>
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
                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gray-100" />
                            
                            {pipeline.map((step, idx) => {
                                const isDone    = idx < currentIdx;
                                const isCurrent = idx === currentIdx;
                                const isPending = idx > currentIdx;
                                return (
                                    <div key={step.key} className={`flex items-start gap-5 relative z-10 transition-all ${
                                        isPending ? 'opacity-30' : 'opacity-100'
                                    }`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-md shrink-0 mt-0.5 ${
                                            isDone    ? 'bg-green-500 text-white' :
                                            isCurrent ? 'bg-[#ff4b3a] text-white ring-4 ring-red-200 ring-offset-1' :
                                                        'bg-gray-100'
                                        }`}>
                                            {isDone ? (
                                                <CheckCircle2 size={14} className="text-white" />
                                            ) : (
                                                <span className="text-xs">{step.icon}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black leading-none ${
                                                isDone ? 'text-green-600' :
                                                isCurrent ? 'text-gray-900' :
                                                            'text-gray-400'
                                            }`}>{step.label}</p>
                                            {(isDone || isCurrent) && (
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    {isCurrent ? '⏳ In progress...' : `✓ ${formatTime(order.updated_at)}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {order.status === 'delivered' && (
                            <div className="mt-8 p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                                <p className="text-2xl mb-2">🎉</p>
                                <p className="font-black text-green-700 text-sm">Order Delivered!</p>
                                <p className="text-[10px] text-green-500 font-bold mt-1">Enjoy your meal!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
