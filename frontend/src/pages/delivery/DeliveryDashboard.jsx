import React, { useState } from 'react';
import { Package, MapPin, IndianRupee, Clock, CheckCircle, Navigation, TrendingUp, Bike } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useLocationTracking from '../../hooks/useLocationTracking';

const DELIVERIES = [];

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
    const [deliveries, setDeliveries] = useState(DELIVERIES);
    const [activeDelivery, setActiveDelivery] = useState(null);

    // Initialize real-time location tracking
    useLocationTracking(user?.id, localStorage.getItem('access_token'), activeDelivery?.id);

  const acceptDelivery = (id) => {
    const d = deliveries.find(x => x.id === id);
    setActiveDelivery({ ...d, status: 'pickup' });
    setDeliveries(prev => prev.filter(x => x.id !== id));
  };

  const advanceStatus = () => {
    if (!activeDelivery) return;
    if (activeDelivery.status === 'pickup') setActiveDelivery(p => ({ ...p, status: 'delivering' }));
    else if (activeDelivery.status === 'delivering') setActiveDelivery(p => ({ ...p, status: 'done' }));
    else setActiveDelivery(null);
  };

  const STATUS_LABEL = { pickup: 'Heading to Restaurant', delivering: 'Out for Delivery', done: 'Delivered! 🎉' };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Delivery Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your active deliveries and earnings.</p>
        </div>
        <button
          onClick={() => setOnline(v => !v)}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            online ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-600'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
          {online ? 'You are Online' : 'You are Offline'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} label="Delivered Today" value="6" iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={IndianRupee} label="Today's Earnings" value="₹380" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard icon={Navigation} label="KM Covered" value="24 km" iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard icon={TrendingUp} label="Acceptance Rate" value="94%" iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className={`rounded-2xl p-6 text-white shadow-xl ${activeDelivery.status === 'done' ? 'bg-green-500' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bike size={18} />
                <span className="font-bold text-sm uppercase tracking-wide">Active Delivery · {activeDelivery.id}</span>
              </div>
              <h2 className="text-xl font-black">{STATUS_LABEL[activeDelivery.status]}</h2>
              {activeDelivery.status !== 'done' && (
                <div className="mt-3 space-y-1">
                  <p className="text-white/70 text-sm flex items-center gap-2">
                    <MapPin size={14} />
                    {activeDelivery.status === 'pickup' ? `📍 ${activeDelivery.restaurantAddr}` : `📍 ${activeDelivery.customerAddr}`}
                  </p>
                  <p className="text-white/60 text-xs">{activeDelivery.customer} · {activeDelivery.items}</p>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black">₹{activeDelivery.earnings}</p>
              <p className="text-white/60 text-xs">Earnings</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 flex gap-2">
            {['pickup', 'delivering', 'done'].map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                ['pickup', 'delivering', 'done'].indexOf(activeDelivery.status) >= i ? 'bg-white' : 'bg-white/25'
              }`} />
            ))}
          </div>

          <button
            onClick={advanceStatus}
            className="mt-4 w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            {activeDelivery.status === 'pickup' ? '✅ Picked up — Start Delivery' :
             activeDelivery.status === 'delivering' ? '🏁 Mark as Delivered' :
             'Close'}
          </button>
        </div>
      )}

      {/* Available Deliveries */}
      {online && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
            <Package size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-800">Available Deliveries</h2>
            <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{deliveries.length}</span>
          </div>

          {deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <Package size={40} className="mb-3 text-gray-300" />
              <p className="font-medium">No deliveries available right now</p>
              <p className="text-sm">Stay online — new orders appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {deliveries.map(d => (
                <div key={d.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{d.id}</span>
                        <span className="text-xs text-gray-400">· {d.distance}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">{d.items}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black text-gray-900">₹{d.earnings}</p>
                      <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                        <Clock size={11} /> {d.eta}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-bold text-gray-700 mb-0.5">🍽️ Pickup</p>
                      <p>{d.restaurant}</p>
                      <p className="text-gray-400">{d.restaurantAddr}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="font-bold text-gray-700 mb-0.5">📦 Deliver to</p>
                      <p>{d.customer}</p>
                      <p className="text-gray-400">{d.customerAddr}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => acceptDelivery(d.id)}
                    disabled={!!activeDelivery}
                    className="w-full bg-[#ff4b3a] hover:bg-[#e03d2e] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-red-100"
                  >
                    {activeDelivery ? 'Complete current delivery first' : 'Accept Delivery'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!online && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center text-gray-400 shadow-sm">
          <Bike size={48} className="mb-4 text-gray-300" />
          <p className="font-bold text-lg text-gray-500">You're offline</p>
          <p className="text-sm">Toggle online above to start receiving deliveries</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;
