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
    const [online, setOnline] = useState(true);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [stats, setStats] = useState({ deliveredToday: 0, earningsToday: 0, kmToday: 0, rate: '100%' });
    const [loading, setLoading] = useState(true);
    const [showQrModal, setShowQrModal] = useState(false);

    // Track real location if active delivery exists
    useLocationTracking(user?.id, localStorage.getItem('access_token'), activeDelivery?.id);

    useEffect(() => {
        if (online) {
            refreshDashboard();
            const interval = setInterval(refreshDashboard, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [online]);

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
            online ? 'bg-green-500 text-white shadow-xl shadow-green-100' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
          {online ? 'ONLINE' : 'OFFLINE'}
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

      {/* Available Jobs list */}
      {online && !activeDelivery && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-8 py-6 border-b border-gray-50 bg-gray-50/50">
            <Package size={20} className="text-orange-500" />
            <h2 className="font-black text-gray-900 uppercase tracking-tight">Available Gigs</h2>
            <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] font-black px-2.5 py-1 rounded-full">{availableOrders.length} NEARBY</span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package size={32} />
              </div>
              <p className="font-bold text-gray-400">Hub is quiet right now...</p>
              <p className="text-xs uppercase tracking-widest mt-1">New batches appear every minute</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {availableOrders.map(d => (
                <div key={d.id} className="p-8 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-md">ORDER #{d.id.slice(-5).toUpperCase()}</span>
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock size={12} /> {d.restaurant?.delivery_time || 20}m ETA</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant</p>
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{d.restaurant?.name || 'Local Eatery'}</p>
                                <p className="text-xs text-gray-500 truncate">{d.restaurant?.address}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Area</p>
                                <p className="font-bold text-gray-900">{d.delivery_address?.split(',')[0] || 'Nearby Customer'}</p>
                                <p className="text-xs text-gray-500">Cash on Delivery</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end gap-3 min-w-[120px]">
                        <p className="text-3xl font-black text-gray-900">₹{d.total_amount}</p>
                        <button
                            disabled={loading}
                            onClick={() => handleClaim(d.id)}
                            className="bg-[#ff4b3a] text-white font-black px-6 py-3 rounded-xl hover:bg-black transition-all duration-300 active:scale-90 shadow-lg shadow-red-100 flex items-center gap-2 text-xs"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'CLAIM'}
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
