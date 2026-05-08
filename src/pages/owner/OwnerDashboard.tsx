import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

function OwnerNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Overview', emoji: '📊', path: '/owner' },
    { id: 'orders', label: 'Orders', emoji: '📦', path: '/owner/orders' },
    { id: 'menu', label: 'Inventory', emoji: '📋', path: '/owner' },
    { id: 'analytics', label: 'Revenue', emoji: '📈', path: '/owner' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-surface/80 backdrop-blur-xl border-t border-outline-variant/30 px-6 pb-8 pt-4">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative
              ${active === item.id ? 'text-primary scale-110' : 'text-on-surface-variant hover:text-on-surface'}`}>
            <span className="text-2xl">{item.emoji}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${active === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.label}</span>
            {active === item.id && (
              <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, currentUser } = useApp();
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => !['delivered'].includes(o.status));

  return (
    <div className="bg-surface min-h-screen pb-32">
      {/* Premium Dashboard Header */}
      <div className="relative h-96 overflow-hidden bg-charcoal">
        <img 
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          alt="Kitchen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        
        <header className="relative z-10 pt-16 px-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-white font-lexend font-black text-3xl shadow-2xl shadow-primary/40 group-hover:rotate-6 transition-transform">B</div>
                <div>
                  <h1 className="font-lexend font-black text-4xl text-white tracking-tight">The Velvet Bistro</h1>
                  <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Management Portal • {currentUser?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active Storefront</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                  <span className="text-yellow-500 text-xs">★</span>
                  <span className="text-white font-bold text-xs">0.0 (0 Reviews)</span>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/login')}
              className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest border border-white/20 transition-all backdrop-blur-md">
              Logout System
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { label: "Today's Gross", value: `$${revenue.toFixed(2)}`, trend: '+14%', color: 'text-primary' },
              { label: 'Pending Orders', value: pendingOrders.length, trend: 'Action Required', color: 'text-orange-500' },
              { label: 'Active Kitchen', value: activeOrders.length, trend: 'Processing', color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="glass-3 rounded-[32px] p-6 border border-white/10 shadow-2xl shadow-charcoal/20">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`font-lexend font-black text-3xl ${s.color}`}>{s.value}</p>
                  <span className="text-[10px] font-bold text-emerald-400">{s.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </header>
      </div>

      <div className="max-w-4xl mx-auto px-8 -mt-10 relative z-20 space-y-10">
        {/* Urgent Task: Pending Orders */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-lexend font-black text-2xl text-on-surface">Urgent Requests</h2>
              <p className="text-on-surface-variant font-medium text-sm">Accept orders to begin preparation</p>
            </div>
            <button onClick={() => navigate('/owner/orders')} className="text-primary font-black text-xs uppercase tracking-widest hover:underline">View All Tickets</button>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="glass-1 rounded-[40px] p-12 text-center border border-outline-variant/30">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="font-lexend font-black text-xl text-on-surface">Kitchen is Clear</h3>
              <p className="text-on-surface-variant mt-2 max-w-xs mx-auto">No pending orders waiting for approval. Great job maintaining the flow!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingOrders.map(order => (
                <div key={order.id} className="glass-1 rounded-[40px] p-8 border border-primary/20 shadow-xl shadow-primary/5 group hover:border-primary transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Incoming #{order.id}</p>
                      <h4 className="font-lexend font-black text-2xl text-on-surface">New Order</h4>
                    </div>
                    <p className="font-lexend font-black text-3xl text-primary">${order.total.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-3 mb-8 bg-surface-container/50 rounded-3xl p-5 border border-outline-variant/30">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{item.quantity}</span>
                          <span className="font-bold text-sm text-on-surface">{item.menuItem.name}</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 btn-primary rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      Accept Ticket
                    </button>
                    <button className="px-6 rounded-2xl border border-outline-variant text-on-surface-variant font-bold text-xs uppercase hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Store Insights */}
        <section>
          <h2 className="font-lexend font-black text-2xl text-on-surface mb-6">Store Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Prep', value: '0m', icon: '⚡', color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Rating', value: '0.0', icon: '⭐', color: 'bg-yellow-50 text-yellow-600' },
              { label: 'Missed', value: '0', icon: '📉', color: 'bg-red-50 text-red-600' },
              { label: 'Peak Hour', value: '--', icon: '🔥', color: 'bg-purple-50 text-purple-600' },
            ].map(m => (
              <div key={m.label} className="glass-1 rounded-[32px] p-6 border border-outline-variant/30 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${m.color}`}>{m.icon}</div>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{m.label}</p>
                  <p className="font-lexend font-black text-xl">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Kitchen Feed */}
        <section className="bg-charcoal rounded-[48px] p-10 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl group-hover:rotate-12 transition-transform">🔥</div>
          <div className="relative z-10">
            <h2 className="font-lexend font-black text-2xl text-white mb-2">Live Kitchen Feed</h2>
            <p className="text-white/40 font-medium mb-8">Real-time status of items on the grill</p>
            
            <div className="space-y-4">
              {activeOrders.slice(0, 3).map(o => (
                <div key={o.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-3xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xs">#{o.id.slice(-3)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-bold text-sm capitalize">{o.status}</span>
                      <span className="text-white/40 text-[10px] font-black uppercase">In Progress</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[65%] animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-4 rounded-2xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
              Launch Kitchen Display System (KDS)
            </button>
          </div>
        </section>
      </div>

      <OwnerNav active="dashboard" />
    </div>
  );
}
