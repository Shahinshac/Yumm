import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, MapPin, IndianRupee, Clock, CheckCircle, Navigation, 
  TrendingUp, Bike, Loader2, QrCode, X, Signal, Power, 
  ChevronRight, Map as MapIcon, Phone, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { authService } from '../../services/authService';
import useLocationTracking from '../../hooks/useLocationTracking';
import { QRCodeSVG } from 'qrcode.react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 hover:border-gray-200 transition-all group">
    <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
      <Icon size={20} className={color} />
    </div>
    <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
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
    const [showItems, setShowItems] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState(null);
    const [requestTimeLeft, setRequestTimeLeft] = useState(60);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const requestTimerRef = useRef(null);

    const { socket } = useLocationTracking(user?.id, localStorage.getItem('access_token'), activeDelivery?.id);

    useEffect(() => {
        if (user) {
            deliveryService.updateStatus(null, online ? 'online' : 'offline').catch(() => {});
        }

        if (online) {
            refreshDashboard();
            const interval = setInterval(refreshDashboard, 30000); 
            
            if (socket) {
                socket.on('new_delivery_request', (order) => {
                    if (!activeDelivery) {
                        setIncomingRequest(order);
                        setRequestTimeLeft(60);
                        try { new Audio('/assets/notification.mp3').play(); } catch(e) {}
                    }
                });

                socket.on('clear_delivery_request', (data) => {
                    if (incomingRequest?.id === data.order_id) {
                        setIncomingRequest(null);
                    }
                });

                socket.on('request_accepted_success', (data) => {
                    setIncomingRequest(null);
                    refreshDashboard();
                });

                socket.on('request_accepted_failed', (data) => {
                    alert(data.error || "Mission was taken by another pilot.");
                    setIncomingRequest(null);
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
                deliveryService.getOrders(),
                deliveryService.getStats().catch(() => ({ deliveredToday: 0, earningsToday: 0 }))
            ]);
            
            setAvailableOrders(avail || []);
            setStats(s || { deliveredToday: 0, earningsToday: 0, kmToday: 0, rate: '100%' });
            
            const active = assigned?.find(o => o.status !== 'delivered');
            setActiveDelivery(active || null);
        } catch (err) {
            console.error("Dashboard refresh failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceStatus = async () => {
        if (!activeDelivery) return;
        let nextStatus = '';
        if (activeDelivery.status === 'picked') nextStatus = 'delivering';
        else if (activeDelivery.status === 'on_the_way') nextStatus = 'completed';
        
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

    const handleNavigation = () => {
        if (!activeDelivery) return;
        const isPickup = activeDelivery.status === 'picked';
        let dest = isPickup ? activeDelivery.restaurant?.address : activeDelivery.delivery_address;
        
        // Use coordinates if available for better accuracy
        if (isPickup && activeDelivery.restaurant?.location?.coordinates) {
             const [lng, lat] = activeDelivery.restaurant.location.coordinates;
             dest = `${lat},${lng}`;
        } else if (!isPickup && activeDelivery.destination_coords) {
             const [lat, lng] = activeDelivery.destination_coords;
             dest = `${lat},${lng}`;
        }

        const encodedDest = encodeURIComponent(dest || '');
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`, '_blank');
    };

    const handleCallStoreOrCustomer = () => {
        if (!activeDelivery) return;
        const phone = activeDelivery.status === 'picked' ? activeDelivery.restaurant?.phone : activeDelivery.customer_phone;
        if (phone) window.open(`tel:${phone}`);
        else alert("Phone number not available.");
    };

  const handleChangePassword = async () => {
      if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
          setPasswordError('Please fill in all password fields.');
          return;
      }
      if (passwordData.new !== passwordData.confirm) {
          setPasswordError('New passwords do not match.');
          return;
      }
      if (passwordData.new.length < 6) {
          setPasswordError('New password must be at least 6 characters.');
          return;
      }

      setPasswordSaving(true);
      setPasswordError('');
      setPasswordMessage('');
      try {
          await authService.changePassword({
              current_password: passwordData.current,
              new_password: passwordData.new
          });
          setPasswordMessage('Password changed successfully.');
          setPasswordData({ current: '', new: '', confirm: '' });
      } catch (err) {
          setPasswordError(err.response?.data?.error || 'Failed to change password.');
      } finally {
          setPasswordSaving(false);
      }
  };

  if (loading && !activeDelivery && availableOrders.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="animate-spin text-[#e23744] mb-6" size={48} />
              <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Fleet Pulse Syncing...</p>
          </div>
      );
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-24 font-sans">

      {/* RIDER CONSOLE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8 mt-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500 animate-ping' : 'bg-gray-300'}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${online ? 'text-green-500' : 'text-gray-400'}`}>
                {online ? 'Active on Fleet' : 'System Standby'}
              </span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic">Fleet Station</h1>
           <p className="text-gray-400 font-bold text-sm mt-2">Pilot: {user?.full_name} • ID: #YUMM-FL-12</p>
        </div>
        
        <button
          onClick={() => setOnline(!online)}
          className={`group flex w-full md:w-auto justify-center md:justify-start items-center gap-4 pl-4 pr-8 py-3 md:py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-2xl ${
            online ? 'bg-[#e23744] text-white shadow-red-100' : 'bg-black text-white shadow-gray-200'
          }`}
        >
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
             <Power size={20} />
          </div>
          {online ? 'Duty On' : 'Go Online'}
        </button>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckCircle} label="Success" value={stats.deliveredToday || 0} color="text-green-500" />
        <StatCard icon={IndianRupee} label="Daily Pay" value={`₹${stats.earningsToday || 0}`} color="text-blue-500" />
        <StatCard icon={Navigation} label="Kms" value={`${stats.kmToday || 0}`} color="text-purple-500" />
        <StatCard icon={TrendingUp} label="Rank" value="Gold" color="text-orange-500" />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                  <h2 className="text-xl font-black text-gray-900">Change Account Password</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your delivery account password securely.</p>
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                  type="password"
                  value={passwordData.current}
                  onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                  placeholder="Current password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#ff4b3a] focus:bg-white transition"
              />
              <input
                  type="password"
                  value={passwordData.new}
                  onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                  placeholder="New password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#ff4b3a] focus:bg-white transition"
              />
              <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#ff4b3a] focus:bg-white transition"
              />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="space-y-2">
                  {passwordMessage && <p className="text-green-600 font-bold text-sm">{passwordMessage}</p>}
                  {passwordError && <p className="text-red-500 font-bold text-sm">{passwordError}</p>}
              </div>
              <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="bg-[#ff4b3a] text-white rounded-2xl px-6 py-4 uppercase text-[10px] font-black tracking-[0.2em] shadow-lg hover:bg-[#e03d2e] disabled:opacity-50 transition"
              >
                  {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
          </div>
      </div>

      {/* MISSION CARD (ACTIVE) */}
      {activeDelivery ? (
        <div className="bg-gray-950 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 md:p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000 origin-top-right">
             <Bike size={200} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8 md:gap-10">
            <div className="space-y-6 flex-1 w-full">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Mission in Progress · {activeDelivery.id.slice(-6).toUpperCase()}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9]">
                 {activeDelivery.status === 'picked' ? 'Navigate to \nStore' : 'Navigate to \nCustomer'}
              </h2>

              <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
                 <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl text-white/40"><MapPin size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] mb-1">Target Address</p>
                            <p className="text-lg md:text-xl font-bold text-white/90 leading-tight italic line-clamp-3">
                              {activeDelivery.status === 'picked' ? activeDelivery.restaurant?.address : activeDelivery.delivery_address}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleCallStoreOrCustomer} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition shrink-0 active:scale-95">
                        <Phone size={20} />
                    </button>
                 </div>
              </div>

              {/* Order Payload Content Verifier */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mt-4">
                  <button onClick={() => setShowItems(!showItems)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition">
                      <div className="flex items-center gap-2">
                          <FileText size={16} className="text-white/50" />
                          <span className="text-xs font-black uppercase tracking-widest text-white/80">Payload Verification</span>
                      </div>
                      {showItems ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
                  </button>
                  {showItems && (
                      <div className="p-4 space-y-2 border-t border-white/10 text-sm font-medium text-white/70">
                          {activeDelivery.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6 shrink-0 w-full md:w-auto">
               <div className="p-6 md:p-8 bg-white/5 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 backdrop-blur-xl text-center md:text-right w-full md:min-w-[180px]">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Pilot Payout</p>
                  <p className="text-4xl md:text-5xl font-black text-orange-500 tracking-tighter italic">₹{(activeDelivery.total_amount * 0.15 + 20).toFixed(0)}</p>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex items-center justify-center md:justify-end gap-2 text-green-400">
                     <Signal size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Priority Task</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 md:mt-12">
             <button
                onClick={handleAdvanceStatus}
                disabled={loading}
                className="bg-white text-black hover:bg-orange-500 hover:text-white font-black py-4 md:py-6 rounded-[2rem] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 active:scale-95 group/btn"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} className="group-hover/btn:scale-110 transition-transform" />}
                <span className="text-xs uppercase tracking-[0.2em]">{activeDelivery.status === 'picked' ? 'Arrived at Store' : 'Hand over Food'}</span>
             </button>

             <button onClick={handleNavigation} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-4 md:py-6 rounded-[2rem] transition-all flex items-center justify-center gap-3 active:scale-95">
                <MapIcon size={20} />
                <span className="text-xs uppercase tracking-[0.2em]">Open Navigation</span>
             </button>
          </div>

          {activeDelivery.payment_method === 'cod' && (
            <button
              onClick={() => setShowQrModal(true)}
              className="mt-4 w-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3"
            >
              <QrCode size={20} />
              <span className="text-xs uppercase tracking-[0.2em]">Collection QR Code</span>
            </button>
          )}
        </div>
      ) : (
        /* STANDBY VIEW */
        <div className={`bg-gray-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 p-12 md:p-24 text-center transition-all ${online ? 'border-orange-500/30' : ''}`}>
           <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${online ? 'bg-orange-50 text-orange-500 scale-110' : 'bg-white text-gray-200 shadow-sm'}`}>
               <Bike size={40} className={`md:w-[48px] md:h-[48px] ${online ? 'animate-bounce' : ''}`} />
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {online ? 'Connecting to Hub...' : 'Pilot Station Offline'}
           </h2>
           <p className="text-gray-400 font-bold text-xs md:text-sm tracking-tight mt-2 max-w-xs mx-auto">
             {online ? 'Standby for high-priority delivery requests from nearby merchants.' : 'Access live requests by switching your pilot status to Duty On.'}
           </p>
        </div>
      )}

      {/* REQUEST OVERLAY (SWIGGY/ZOMATO STYLE) */}
      {incomingRequest && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-[#e23744] p-10 text-white relative">
               <div className="absolute top-6 right-10">
                  <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center font-black text-2xl animate-pulse">
                      {requestTimeLeft}
                  </div>
               </div>
               <Signal size={40} className="mb-6" />
               <h2 className="text-4xl font-black tracking-tighter italic">NEW MISSION</h2>
               <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mt-2 italic">Priority Protocol Activated</p>
            </div>
            
            <div className="p-10 space-y-8">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Guaranteed Earning</p>
                   <p className="text-6xl font-black text-gray-900 tracking-tighter">₹{(incomingRequest.total_amount * 0.15 + 20).toFixed(0)}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-2xl text-gray-400"><MapPin size={20} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Store Location</p>
                            <p className="text-lg font-black text-gray-900 italic">{incomingRequest.restaurant_name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={async () => {
                             try {
                                 setLoading(true);
                                 if (socket) {
                                     socket.emit('delivery_accept_request', { 
                                         order_id: incomingRequest.id, 
                                         token: localStorage.getItem('access_token') 
                                     });
                                 }
                                 setIncomingRequest(null);
                             } catch(e) { alert("Accept failed"); } 
                             finally { setLoading(false); }
                        }}
                        className="py-6 bg-black text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform shadow-2xl active:scale-95"
                    >
                        Accept Mission
                    </button>
                    <button 
                        onClick={() => setIncomingRequest(null)}
                        className="py-4 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-gray-900"
                    >
                        Ignore Request
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQrModal && activeDelivery?.restaurant_upi_id && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
            <div className="bg-black p-8 text-white text-center relative">
              <button onClick={() => setShowQrModal(false)} className="absolute top-6 right-6 text-white/30 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-black tracking-tight mb-2 italic">COLLECT PAYMENT</h2>
              <p className="text-orange-500 font-black text-4xl tracking-tighter">₹{activeDelivery.total_amount}</p>
            </div>
            <div className="p-10 flex flex-col items-center gap-6">
              <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl border-2 border-gray-50">
                <QRCodeSVG
                  value={`upi://pay?pa=${activeDelivery.restaurant_upi_id}&am=${activeDelivery.total_amount}&cu=INR&tn=YummFood`}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Scan with any UPI App</p>
              <button onClick={() => setShowQrModal(false)} className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-transform">
                Payment Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
