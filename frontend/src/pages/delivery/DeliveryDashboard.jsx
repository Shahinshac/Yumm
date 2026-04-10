import React, { useState, useEffect } from 'react';
import { Package, MapPin, IndianRupee, Clock, CheckCircle, Navigation, TrendingUp, Bike, Loader2, QrCode, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import useLocationTracking from '../../hooks/useLocationTracking';
import { QRCodeSVG } from 'qrcode.react';

const StatCard = ({ icon: Icon, label, value, iconColor, iconBg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`${iconBg} p-3 rounded-xl`}>
      <Icon size={20} className={iconColor} />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const DeliveryDashboard = () => {
    const { user } = useAuth();
    const [online, setOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [stats, setStats] = useState({ deliveredToday: 0, earningsToday: 0, kmToday: 0, rate: '100%' });
    const [loading, setLoading] = useState(true);
    const [showQrModal, setShowQrModal] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState(null);
    const [requestTimeLeft, setRequestTimeLeft] = useState(60);
    const requestTimerRef = useRef(null);

    // Track real location and get socket for real-time requests
    const { socket } = useLocationTracking(user?.id, localStorage.getItem('access_token'), activeDelivery?.id);

    useEffect(() => {
        // Sync online status with backend
        if (user) {
            deliveryService.updateStatus(null, online ? 'online' : 'offline').catch(() => {});
        }

        if (online) {
            refreshDashboard();
            const interval = setInterval(refreshDashboard, 30000); 
            
            // Listen for real-time push requests
            if (socket) {
                socket.on('new_delivery_request', (order) => {
                    // Only show if not already on a delivery
                    if (!activeDelivery) {
                        setIncomingRequest(order);
                        setRequestTimeLeft(60);
                        // Play alert sound if possible
                        try { new Audio('/assets/notification.mp3').play(); } catch(e) {}
                    }
                });

                socket.on('clear_delivery_request', (data) => {
                    if (incomingRequest?.id === data.order_id) {
                        setIncomingRequest(null);
                    }
                });
            }

            return () => {
                clearInterval(interval);
                if (socket) {
                    socket.off('new_delivery_request');
                    socket.off('clear_delivery_request');
                }
            };
        }
    }, [online, activeDelivery, socket]);

    // Timer logic for incoming request
    useEffect(() => {
        if (incomingRequest && requestTimeLeft > 0) {
            requestTimerRef.current = setTimeout(() => {
                setRequestTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (requestTimeLeft === 0) {
            setIncomingRequest(null);
        }
        return () => clearTimeout(requestTimerRef.current);
    }, [incomingRequest, requestTimeLeft]);

    const refreshDashboard = async () => {
        try {
            const [avail, assigned, s] = await Promise.all([
                deliveryService.getAvailableOrders(),
                deliveryService.getOrders(), // This returns currently assigned
                deliveryService.getStats().catch(() => ({ deliveredToday: 0, earningsToday: 0 }))
            ]);
            
            setAvailableOrders(avail || []);
            setStats(s || { deliveredToday: 0, earningsToday: 0, kmToday: 0, rate: '100%' });
            
            // Check if there's an active (not delivered) order
            const active = assigned?.find(o => o.status !== 'delivered');
            setActiveDelivery(active || null);
        } catch (err) {
            console.error("Dashboard refresh failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (id) => {
        try {
            setLoading(true);
            await deliveryService.claimOrder(id);
            await refreshDashboard();
        } catch (err) {
            alert("Claim failed: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceStatus = async () => {
        if (!activeDelivery) return;
        
        let nextStatus = '';
        if (activeDelivery.status === 'picked') nextStatus = 'delivering';
        else if (activeDelivery.status === 'on_the_way') nextStatus = 'done';
        
        if (!nextStatus) return;

        try {
            setLoading(true);
            await deliveryService.updateStatus(activeDelivery.id, nextStatus);
            await refreshDashboard();
        } catch (err) {
            alert("Status update failed.");
        } finally {
            setLoading(false);
        }
    };

    const STATUS_UI = {
        picked: { label: 'Picked Up - Head to Customer', next: 'On my Way' },
        on_the_way: { label: 'Near Customer - Mark Delivered', next: 'Delivered' },
        delivered: { label: 'Delivered! 🎉', next: '' }
    };

  if (loading && !activeDelivery && availableOrders.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with hub...</p>
          </div>
      );
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto px-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Delivery Control</h1>
          <p className="text-gray-500 text-sm mt-1">Status: {online ? 'Searching for near orders...' : 'Resting'}</p>
        </div>
        <button
          onClick={() => setOnline(v => !v)}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 active:scale-95 ${
            online ? 'bg-green-500 text-white shadow-xl shadow-green-100' : 'bg-gray-900 text-white shadow-xl shadow-gray-200'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
          {online ? 'DUTY ON' : 'GO ONLINE'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Delivered" value={stats.deliveredToday || 0} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={IndianRupee} label="Earnings" value={`₹${stats.earningsToday || 0}`} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard icon={Navigation} label="KM Covered" value={`${stats.kmToday || 0} km`} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard icon={TrendingUp} label="Rank" value="Gold" iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      {/* Active Delivery Card */}
      {activeDelivery && (
        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
             <Bike size={160} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-400">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                Live Mission · {activeDelivery.id.slice(-6).toUpperCase()}
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                 {activeDelivery.status === 'picked' ? 'Heading to Restaurant' : 'Out for Delivery'}
              </h2>
              <div className="space-y-3 pt-2">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/5 rounded-xl text-white/50"><MapPin size={18} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Target Location</p>
                        <p className="text-sm font-bold text-white/80">{activeDelivery.status === 'picked' ? activeDelivery.restaurant?.address : activeDelivery.delivery_address}</p>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="text-right shrink-0">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-3xl font-black text-orange-500">₹{activeDelivery.total_amount}</p>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Order Value</p>
               </div>
            </div>
          </div>

          <button
            onClick={handleAdvanceStatus}
            disabled={loading}
            className="mt-8 w-full bg-white text-gray-900 hover:bg-orange-500 hover:text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-black/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
            {activeDelivery.status === 'picked' ? 'MARK AS PICKED UP' : 'MARK AS DELIVERED'}
          </button>

          {/* COD QR Button */}
          {(activeDelivery.payment_method === 'cod' || !activeDelivery.payment_method) && activeDelivery.restaurant_upi_id && (
            <button
              onClick={() => setShowQrModal(true)}
              className="mt-3 w-full bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500 hover:text-white font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <QrCode size={18} /> SHOW PAYMENT QR TO CUSTOMER
            </button>
          )}
        </div>
      )}

      {/* Incoming Request Popup (Swiggy Style) */}
      {incomingRequest && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-[#ff4b3a] p-8 text-white relative">
               <div className="absolute top-4 right-8 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center font-black text-xl">
                      {requestTimeLeft}
                  </div>
                  <p className="text-[10px] uppercase font-bold mt-1 opacity-60">Sec left</p>
               </div>
               <Bike size={40} className="mb-4" />
               <h2 className="text-3xl font-black tracking-tight">New Order!</h2>
               <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-2">Incoming Mission Assigned</p>
            </div>
            
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Potential Earning</p>
                        <p className="text-4xl font-black text-gray-900">₹{(incomingRequest.total_amount * 0.2 + 20).toFixed(0)}</p>
                    </div>
                    {incomingRequest.tip_amount > 0 && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black">
                           + ₹{incomingRequest.tip_amount} TIP
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400"><MapPin size={16} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">From</p>
                            <p className="text-sm font-bold text-gray-800">{incomingRequest.restaurant_name}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setIncomingRequest(null)}
                        className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition active:scale-95"
                    >
                        IGNORE
                    </button>
                    <button 
                         onClick={async () => {
                             try {
                                 setLoading(true);
                                 // Emit through socket for instant feedback
                                 if (socket) {
                                     socket.emit('delivery_accept_request', { 
                                         order_id: incomingRequest.id, 
                                         token: localStorage.getItem('access_token') 
                                     });
                                 }
                                 setIncomingRequest(null);
                             } catch(e) { 
                                 alert("Accept failed"); 
                             } finally {
                                 setLoading(false);
                             }
                         }}
                        className="py-4 bg-[#ff4b3a] text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-xl shadow-red-200 active:scale-95"
                    >
                        ACCEPT
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline View */}
      {!online && (
        <div className="bg-white rounded-[40px] border border-gray-100 p-24 text-center shadow-sm space-y-4">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Bike size={48} />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Mission Control Offline</h2>
          <p className="text-gray-400 max-w-xs mx-auto font-medium">Switch to online to start receiving live delivery requests from nearby restaurants.</p>
        </div>
      )}
      {/* COD Payment QR Modal */}
      {showQrModal && activeDelivery?.restaurant_upi_id && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white text-center relative">
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={20} />
              </button>
              <QrCode size={24} className="mx-auto mb-2 text-orange-400" />
              <h2 className="font-black">Show This to Customer</h2>
              <p className="text-gray-400 text-sm mt-1">Order #{activeDelivery.id?.slice(-6).toUpperCase()}</p>
              <p className="text-orange-400 font-black text-xl mt-1">₹{activeDelivery.total_amount}</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-2 border-gray-100">
                <QRCodeSVG
                  value={`upi://pay?pa=${activeDelivery.restaurant_upi_id}&am=${activeDelivery.total_amount}&cu=INR&tn=FoodDelivery`}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="H"
                />
              </div>
              <p className="text-xs font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">{activeDelivery.restaurant_upi_id}</p>
              <p className="text-[10px] text-gray-400 text-center font-medium">Ask customer to scan with GPay / PhonePe / Paytm</p>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
