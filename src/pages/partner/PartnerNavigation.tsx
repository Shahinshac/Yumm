import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

type PartnerStatus = 'online' | 'offline';

export default function PartnerNavigation() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, currentUser } = useApp();
  const [status, setStatus] = useState<PartnerStatus>('online');
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');

  const availableOrder = orders.find(o => o.status === 'ready');
  const activeDelivery = orders.find(o => o.status === 'delivering');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  return (
    <div className="bg-surface min-h-screen flex flex-col relative overflow-hidden">
      {/* Map Layer (Decorative) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-75 contrast-125 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface" />
        
        {/* Animated Hotspots */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-primary/5 rounded-full animate-pulse flex items-center justify-center border border-primary/10">
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">High Demand</span>
        </div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-emerald-500/5 rounded-full animate-pulse delay-700 flex items-center justify-center border border-emerald-500/10">
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Premium Zone</span>
        </div>
      </div>

      {/* Persistent Header */}
      <header className="relative z-50 pt-16 px-6 pb-6 flex justify-between items-center bg-surface/40 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xl"
              alt="Partner"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
              ${status === 'online' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-charcoal'}`} />
          </div>
          <div>
            <h1 className="font-lexend font-black text-xl text-on-surface leading-none">Alex Thompson</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1.5 flex items-center gap-2">
              ID: {currentUser?.id || 'DP-772'} • <span className={status === 'online' ? 'text-emerald-600' : 'text-charcoal'}>{status}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setStatus(status === 'online' ? 'offline' : 'online')}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
              ${status === 'online' ? 'bg-charcoal text-white shadow-xl shadow-charcoal/20' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'}`}>
            Go {status === 'online' ? 'Offline' : 'Online'}
          </button>
          <button onClick={() => navigate('/login')} className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth={2.5} /></svg>
          </button>
        </div>
      </header>

      {/* Main Stats Hub */}
      <div className="relative z-10 px-6 pt-8 max-w-xl mx-auto w-full flex-1 flex flex-col">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Earnings', value: '$142.50', sub: 'Today', color: 'text-primary' },
            { label: 'Completed', value: deliveredOrders.length + 8, sub: 'Targets', color: 'text-on-surface' },
            { label: 'Rating', value: '4.95', sub: 'Top 1%', color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="glass-3 rounded-[32px] p-6 border border-white/50 text-center shadow-2xl shadow-charcoal/5">
              <p className={`font-lexend font-black text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1">{s.label}</p>
              <p className="text-[9px] font-bold text-on-surface-variant/50 uppercase mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab Selection */}
        <div className="flex bg-surface-container/50 backdrop-blur-md p-1.5 rounded-[24px] mb-8 border border-outline-variant/30">
          {[
            { id: 'available', label: 'Radar', icon: '🚦' },
            { id: 'active', label: 'Transit', icon: '🛵' },
            { id: 'history', label: 'Logs', icon: '📋' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all
                ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-on-surface-variant hover:text-on-surface'}`}>
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          {/* AVAILABLE RADAR */}
          {activeTab === 'available' && (
            <div className="flex-1 flex flex-col">
              {status === 'offline' ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-24 h-24 bg-surface-container rounded-[32px] flex items-center justify-center text-5xl mb-8 grayscale">😴</div>
                  <h2 className="font-lexend font-black text-3xl text-on-surface">You are currently Resting</h2>
                  <p className="text-on-surface-variant mt-4 font-medium leading-relaxed">No requests will be assigned while you are offline. Ready to hit the road?</p>
                  <button onClick={() => setStatus('online')} className="mt-10 btn-primary rounded-[24px] py-5 px-12 text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all">Go Online Now</button>
                </div>
              ) : availableOrder ? (
                <div className="glass-3 rounded-[48px] p-10 border border-primary/20 shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">New Priority Match</span>
                      </div>
                      <h2 className="font-lexend font-black text-4xl text-on-surface tracking-tight">Accept Request?</h2>
                    </div>
                    <div className="text-right">
                      <p className="font-lexend font-black text-4xl text-primary">$12.50</p>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Estimated Pay</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative mb-10">
                    <div className="absolute left-6 top-8 bottom-8 w-1 border-l-2 border-dashed border-outline-variant/50" />
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/50">🏪</div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Pickup From</p>
                        <p className="font-lexend font-black text-xl text-on-surface">{availableOrder.restaurantName}</p>
                        <p className="text-sm font-medium text-on-surface-variant mt-1">1.2 km away • Package ready</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6 relative z-10">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/50">📍</div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Deliver To</p>
                        <p className="font-lexend font-black text-xl text-on-surface">{availableOrder.address}</p>
                        <p className="text-sm font-medium text-on-surface-variant mt-1">3.4 km from vendor • ~12 min</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="px-8 py-5 rounded-[24px] border border-outline-variant font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Decline</button>
                    <button onClick={() => updateOrderStatus(availableOrder.id, 'delivering')}
                      className="flex-1 btn-primary rounded-[24px] py-5 text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                      Accept & Start
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="relative mb-12">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping scale-150 duration-[2000ms]" />
                    <div className="relative w-32 h-32 bg-primary text-white rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-primary/40">🛵</div>
                  </div>
                  <h2 className="font-lexend font-black text-3xl text-on-surface">Scanning Area</h2>
                  <p className="text-on-surface-variant mt-4 font-medium max-w-[280px] mx-auto">We're searching for premium delivery matches in your current zone.</p>
                  
                  <div className="mt-12 glass-1 rounded-[32px] p-6 w-full border border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🏙️</div>
                      <div className="text-left">
                        <p className="font-lexend font-black text-lg text-on-surface leading-none">Downtown Hub</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Surge: 1.5x Multiplier</p>
                      </div>
                    </div>
                    <div className="badge-green px-4 py-2 font-black text-[10px] uppercase">Optimal Zone</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE TRANSIT */}
          {activeTab === 'active' && (
            <div className="flex-1 flex flex-col">
              {activeDelivery ? (
                <div className="glass-3 rounded-[48px] p-10 border border-primary/20 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="font-lexend font-black text-3xl text-on-surface">Active Transit</h2>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Shipment #{activeDelivery.id.slice(-8)}</p>
                    </div>
                    <div className="w-16 h-16 bg-surface-container rounded-3xl flex items-center justify-center text-3xl shadow-inner">📦</div>
                  </div>
                  
                  <div className="bg-surface-container/50 rounded-[32px] p-6 border border-outline-variant/30 mb-8">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-outline-variant/20">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">🥘</div>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface">Contents Check</p>
                        <p className="text-xs text-on-surface-variant font-medium">{activeDelivery.items.length} High-value items secured</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Delivery Note</p>
                    <p className="text-sm font-medium text-on-surface italic">"Leave at front door and ring the smart bell. Thank you!"</p>
                  </div>

                  <button onClick={() => updateOrderStatus(activeDelivery.id, 'delivered')}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-[24px] py-5 text-xl font-lexend font-black shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">
                    Confirm Completion
                  </button>
                  <button className="w-full mt-4 text-on-surface-variant font-black text-[10px] uppercase tracking-widest hover:underline">Contact Customer Center</button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
                  <div className="text-7xl mb-8 grayscale opacity-30">🚚</div>
                  <h2 className="font-lexend font-black text-3xl text-on-surface">No Active Cargo</h2>
                  <p className="text-on-surface-variant mt-4 font-medium">Head back to the radar to scan for new delivery opportunities.</p>
                  <button onClick={() => setActiveTab('available')} className="mt-8 text-primary font-black uppercase text-xs tracking-widest">Switch to Radar →</button>
                </div>
              )}
            </div>
          )}

          {/* HISTORY LOGS */}
          {activeTab === 'history' && (
            <div className="flex-1">
              <div className="flex justify-between items-end mb-8">
                <h2 className="font-lexend font-black text-3xl text-on-surface">Mission History</h2>
                <button className="text-primary font-black text-xs uppercase tracking-widest">Full Report</button>
              </div>
              <div className="space-y-4">
                {deliveredOrders.length === 0 ? (
                  <div className="text-center py-20 bg-surface-container/20 rounded-[40px] border border-dashed border-outline-variant">
                    <p className="text-on-surface-variant font-medium">Your historical ledger is currently empty.</p>
                  </div>
                ) : (
                  deliveredOrders.map(o => (
                    <div key={o.id} className="glass-1 rounded-[32px] p-6 border border-outline-variant/30 flex items-center justify-between group hover:border-primary transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">✓</div>
                        <div>
                          <p className="font-lexend font-black text-lg text-on-surface">#{o.id.slice(-6)}</p>
                          <p className="text-xs font-bold text-on-surface-variant truncate w-40">{o.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-lexend font-black text-xl text-primary">+${(o.total * 0.15).toFixed(2)}</p>
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mt-1">Earnings</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
