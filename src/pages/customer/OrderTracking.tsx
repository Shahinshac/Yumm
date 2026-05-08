import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Received', icon: '📝', desc: 'We have received your order' },
  { id: 'accepted', label: 'Confirmed', icon: '✅', desc: 'The restaurant is reviewing' },
  { id: 'preparing', label: 'Preparing', icon: '🍳', desc: 'The chef is cooking your meal' },
  { id: 'ready', label: 'Ready for Pickup', icon: '🛍️', desc: 'Wait for the delivery partner' },
  { id: 'delivering', label: 'On the Way', icon: '🛵', desc: 'Partner is approaching you' },
  { id: 'delivered', label: 'Delivered', icon: '🏠', desc: 'Enjoy your meal!' }
] as const;

export default function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders } = useApp();
  
  const order = orders.find(o => o.id === orderId) || orders[0];
  const [pulsePos, setPulsePos] = useState({ x: 40, y: 30 });

  useEffect(() => {
    if (order?.status === 'delivering') {
      const interval = setInterval(() => {
        setPulsePos(prev => ({
          x: prev.x + (Math.random() * 2 - 0.5),
          y: prev.y + (Math.random() * 2 - 0.5)
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface">
      <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center text-6xl mb-6 animate-bounce">📍</div>
      <h2 className="font-lexend font-bold text-3xl text-on-surface">Tracking unavailable</h2>
      <p className="text-on-surface-variant mt-3 max-w-xs mx-auto">We couldn't find the order you're looking for.</p>
      <button onClick={() => navigate('/customer')} className="btn-primary mt-8 px-10 py-4 rounded-2xl">Return Home</button>
    </div>
  );

  const currentIdx = STATUS_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="bg-surface min-h-screen pb-32">
      {/* Dynamic Map Header */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-50 contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-transparent to-surface" />
        
        {/* Animated Map Pins */}
        <div className="absolute inset-0 z-0">
          {/* Restaurant Pin */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-2xl border-2 border-primary animate-pulse">🏪</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap uppercase tracking-widest">{order.restaurantName}</div>
            </div>
          </div>
          
          {/* Home Pin */}
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-2xl border-2 border-white">📍</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap uppercase tracking-widest">You</div>
            </div>
          </div>

          {/* Delivery Partner Pulse (only when delivering) */}
          {order.status === 'delivering' && (
            <div className="absolute transition-all duration-[2000ms] ease-linear" style={{ left: `${pulsePos.x}%`, top: `${pulsePos.y}%` }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                <div className="w-10 h-10 bg-primary rounded-full shadow-2xl flex items-center justify-center text-xl border-2 border-white z-10">🛵</div>
              </div>
            </div>
          )}
        </div>

        <header className="absolute top-0 left-0 right-0 pt-14 px-6 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="glass-3 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="glass-3 px-4 py-2 rounded-2xl border border-white/10">
            <span className="font-lexend font-bold text-white text-sm">Order #{order.id}</span>
          </div>
        </header>
      </div>

      {/* Main Content Card */}
      <div className="relative -mt-16 z-20 px-6">
        <div className="glass-3 rounded-[32px] p-8 shadow-2xl shadow-charcoal/20 border border-white/40">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">Status</p>
              <h2 className="font-lexend font-bold text-3xl text-on-surface capitalize">
                {order.status === 'delivering' ? 'On the Way' : order.status}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">ETA</p>
              <p className="font-lexend font-bold text-3xl text-emerald-600">
                {order.status === 'delivered' ? 'Ready' : '~18 min'}
              </p>
            </div>
          </div>

          {/* Partner Row */}
          <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant/30 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                  alt="Driver" className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px]">⭐</div>
              </div>
              <div>
                <p className="font-bold text-on-surface">Alex Thompson</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">Platinum Partner</span>
                  <span className="w-1 h-1 bg-outline-variant rounded-full" />
                  <span className="text-xs font-bold text-primary">★ 4.9</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-11 h-11 rounded-xl bg-white border border-outline-variant flex items-center justify-center text-primary shadow-sm active:scale-90 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-8 relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant/30" />
            
            {STATUS_STEPS.map((s, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={s.id} className="flex items-start gap-6 group">
                  <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500
                    ${isPast ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      isCurrent ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/30 ring-4 ring-primary/10' : 
                      'bg-surface-container text-on-surface-variant'}`}>
                    {isPast ? '✓' : s.icon}
                  </div>
                  <div className={`pt-1 flex-1 transition-opacity duration-500 ${isPast || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                    <p className={`font-lexend font-bold text-lg ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{s.label}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{s.desc}</p>
                    {isCurrent && (
                      <div className="mt-3 flex gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Support Info */}
        <div className="mt-8 glass-1 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">💬</div>
            <p className="font-bold text-sm">Need help with your order?</p>
          </div>
          <button className="text-primary font-bold text-sm hover:underline">Contact Support</button>
        </div>
      </div>

      <MobileNav active="orders" />
    </div>
  );
}
