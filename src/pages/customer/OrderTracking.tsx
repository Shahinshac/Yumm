import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const STATUS_STEPS = ['pending','accepted','preparing','ready','delivering','delivered'] as const;

export default function OrderTracking() {
  const navigate = useNavigate();
  const { orders } = useApp();
  const order = orders[0]; // most recent

  if (!order) return (
    <div className="mobile-frame flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <p className="text-6xl mb-4">📦</p>
      <h2 className="font-lexend font-bold text-2xl">No active orders</h2>
      <button onClick={() => navigate('/customer')} className="btn-primary mt-6">Order Now</button>
    </div>
  );

  const currentIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mobile-frame bg-surface min-h-screen">
      {/* Map area */}
      <div className="relative h-72 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-[#281812]/30" />
        <header className="absolute top-0 left-0 right-0 pt-12 px-6 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="glass-1 px-4 py-2 rounded-full">
            <span className="font-bold text-white text-sm">Order #{order.id}</span>
          </div>
        </header>

        {/* Driver card */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-3 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                alt="Driver" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
              <div>
                <p className="font-bold text-on-surface">James Carter</p>
                <p className="text-xs text-on-surface-variant">Your delivery partner</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ETA */}
      <div className="px-6 py-5">
        <div className="bg-emerald-500 text-white rounded-3xl p-5 flex justify-between items-center shadow-lg shadow-emerald-500/25">
          <div>
            <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Estimated Arrival</p>
            <p className="font-lexend font-bold text-3xl mt-1">~18 mins</p>
          </div>
          <svg className="w-10 h-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 pb-32">
        <h2 className="font-lexend font-bold text-xl mb-5">Order Status</h2>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-outline-variant" />
          <div className="space-y-6 relative">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm z-10
                    ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>
                    {done
                      ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      : <span className="font-bold text-sm">{idx + 1}</span>}
                  </div>
                  <div className={`pt-2 ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-35'}`}>
                    <p className={`font-bold capitalize ${active ? 'text-primary' : 'text-on-surface'}`}>{step.replace(/_/g,' ')}</p>
                    {active && <p className="text-xs text-on-surface-variant mt-0.5 animate-pulse">In progress...</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MobileNav active="orders" />
    </div>
  );
}
