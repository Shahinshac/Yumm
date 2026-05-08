import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

type PartnerStatus = 'online' | 'offline';

export default function PartnerNavigation() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const [status, setStatus] = useState<PartnerStatus>('online');
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');

  // Simulate: orders that are 'ready' need pickup
  const availableOrder = orders.find(o => o.status === 'ready');
  const activeDelivery = orders.find(o => o.status === 'delivering');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="mobile-frame bg-surface min-h-screen flex flex-col relative overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/80 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 pt-12 px-5 flex justify-between items-center">
        <button onClick={() => navigate('/login')} className="glass-1 p-3 rounded-2xl shadow-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Online/Offline toggle */}
        <div className="glass-2 p-1 rounded-full flex gap-1 shadow-lg">
          {(['online', 'offline'] as PartnerStatus[]).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all capitalize
                ${status === s
                  ? s === 'online' ? 'bg-emerald-500 text-white shadow-md' : 'bg-charcoal text-white shadow-md'
                  : 'text-on-surface-variant'}`}>
              {s === 'online' && status === 'online' && <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse" />}
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* Earnings strip */}
      <div className="relative z-10 px-5 mt-4">
        <div className="glass-2 rounded-2xl p-4 grid grid-cols-3 gap-2 shadow-lg">
          {[
            { label: "Today's Earnings", value: '$48.50', color: 'text-primary' },
            { label: 'Deliveries', value: String(deliveredOrders.length + 6) },
            { label: 'Rating', value: '★ 4.9', color: 'text-yellow-500' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`font-lexend font-bold text-xl ${s.color ?? 'text-on-surface'}`}>{s.value}</p>
              <p className="text-xs text-on-surface-variant font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 px-5 mt-4 flex gap-2">
        {([['available', '🚦'], ['active', '🛵'], ['history', '📋']] as const).map(([t, emoji]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all capitalize
              ${activeTab === t ? 'chip-active' : 'chip-inactive'}`}>
            {emoji} {t}
          </button>
        ))}
      </div>

      {/* Spacer — map area */}
      <div className="flex-1 relative z-10 min-h-[80px]" />

      {/* Bottom card */}
      <div className="relative z-10 px-5 pb-10">
        {/* ── Available ── */}
        {activeTab === 'available' && (
          status === 'offline' ? (
            <div className="glass-3 rounded-[32px] p-8 shadow-2xl text-center">
              <p className="text-5xl mb-3">😴</p>
              <h2 className="font-lexend font-bold text-2xl mb-2">You're Offline</h2>
              <p className="text-on-surface-variant mb-6">Go online to start receiving delivery requests</p>
              <button onClick={() => setStatus('online')} className="btn-primary rounded-2xl py-4 w-full text-lg">
                Go Online
              </button>
            </div>
          ) : availableOrder ? (
            <div className="glass-3 rounded-[32px] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-lexend font-bold text-2xl">New Delivery! 🔔</h2>
                <span className="badge-green text-base">$8.50 Est.</span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg flex-shrink-0">🏪</div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pickup</p>
                    <p className="font-bold text-lg">{availableOrder.restaurantName}</p>
                    <p className="text-sm text-on-surface-variant">1.2 miles · Ready now</p>
                  </div>
                </div>
                <div className="ml-5 border-l-2 border-dashed border-outline-variant h-5" />
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-lg flex-shrink-0">📍</div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Dropoff</p>
                    <p className="font-bold text-lg">{availableOrder.address}</p>
                    <p className="text-sm text-on-surface-variant">3.4 miles from pickup · ~18 min</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 btn-secondary rounded-2xl py-4 font-bold">Decline</button>
                <button onClick={() => updateOrderStatus(availableOrder.id, 'delivering')}
                  className="flex-[2] btn-primary rounded-2xl py-4 text-lg shadow-xl shadow-primary/30">
                  ✓ Accept
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-3 rounded-[32px] p-8 shadow-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">🛵</div>
              <h2 className="font-lexend font-bold text-2xl mb-2">Looking for orders…</h2>
              <p className="text-on-surface-variant">Stay in high-demand areas for more requests</p>
              <div className="mt-5 glass-1 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-bold text-on-surface-variant">Zone: Downtown Premium</span>
                <span className="badge-green">High Demand</span>
              </div>
            </div>
          )
        )}

        {/* ── Active Delivery ── */}
        {activeTab === 'active' && (
          activeDelivery ? (
            <div className="glass-3 rounded-[32px] p-6 shadow-2xl">
              <h2 className="font-lexend font-bold text-2xl mb-4">Active Delivery 🛵</h2>
              <div className="glass-1 rounded-2xl p-4 mb-4">
                <p className="font-bold">#{activeDelivery.id}</p>
                <p className="text-on-surface-variant text-sm">{activeDelivery.address}</p>
              </div>
              <button onClick={() => updateOrderStatus(activeDelivery.id, 'delivered')}
                className="w-full bg-emerald-500 text-white rounded-2xl py-4 text-lg font-bold shadow-lg shadow-emerald-500/25">
                ✓ Mark as Delivered
              </button>
            </div>
          ) : (
            <div className="glass-3 rounded-[32px] p-8 shadow-2xl text-center">
              <p className="text-5xl mb-3">🔍</p>
              <p className="font-lexend font-bold text-xl">No active delivery</p>
              <p className="text-on-surface-variant mt-1">Accept an order from the Available tab</p>
            </div>
          )
        )}

        {/* ── History ── */}
        {activeTab === 'history' && (
          <div className="glass-3 rounded-[32px] p-6 shadow-2xl max-h-[50vh] overflow-y-auto">
            <h2 className="font-lexend font-bold text-xl mb-4">Delivery History</h2>
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-on-surface-variant">No completed deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveredOrders.map(o => (
                  <div key={o.id} className="glass-1 rounded-2xl p-4">
                    <div className="flex justify-between">
                      <p className="font-bold">#{o.id}</p>
                      <span className="badge-green">Delivered</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">{o.address}</p>
                    <p className="font-lexend font-bold text-primary mt-1">${(o.total * 0.15).toFixed(2)} earned</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
