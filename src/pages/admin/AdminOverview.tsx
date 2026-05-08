import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',     emoji: '📊', path: '/admin' },
  { id: 'approvals',   label: 'Approvals',    emoji: '✅', path: '/admin/approvals' },
  { id: 'restaurants', label: 'Restaurants',  emoji: '🏪', path: '/admin/restaurants' },
  { id: 'orders',      label: 'Live Orders',  emoji: '📦', path: '/admin/orders' },
  { id: 'drivers',     label: 'Drivers',      emoji: '🛵', path: '/admin/drivers' },
  { id: 'financials',  label: 'Financials',   emoji: '💰', path: '/admin/financials' },
  { id: 'disputes',    label: 'Disputes',     emoji: '⚖️', path: '/admin/disputes' },
];

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const { pendingOwners, pendingPartners } = useApp();
  const pendingCount = pendingOwners.filter(o => o.status === 'pending').length +
                       pendingPartners.filter(p => p.status === 'pending').length;
  return (
    <aside className="w-72 min-h-screen flex flex-col gap-1 p-6 border-r border-outline-variant bg-white/50 backdrop-blur-xl fixed top-0 left-0 bottom-0 z-40">
      <div className="flex items-center gap-4 px-3 py-6 mb-8 bg-primary/5 rounded-3xl border border-primary/10">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-lexend font-black text-2xl shadow-lg shadow-primary/20">N</div>
        <div>
          <p className="font-lexend font-bold text-xl text-on-surface leading-none">NexFood</p>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Control Center</p>
        </div>
      </div>

      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-4 mb-4">Core Platform</p>

      <div className="space-y-1.5">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 text-left group
              ${active === item.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-2'
                : 'text-on-surface hover:bg-surface-container hover:translate-x-1'}`}>
            <span className={`text-xl transition-transform group-hover:scale-125 ${active === item.id ? 'scale-110' : ''}`}>{item.emoji}</span>
            <span className="flex-1">{item.label}</span>
            {item.id === 'approvals' && pendingCount > 0 && (
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${active === 'approvals' ? 'bg-white/30 text-white' : 'bg-primary text-white animate-pulse'}`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-outline-variant/30">
        <button onClick={() => navigate('/login')}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold transition-all group">
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
          <span>Logout System</span>
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="bg-surface min-h-screen flex selection:bg-primary/20">
      <AdminSidebar active={active} />
      <main className="ml-72 flex-1 p-10 min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminOverview() {
  const { orders, restaurants, pendingOwners, pendingPartners, clearAllData } = useApp();

  const stats = [
    { label: 'GTV (Gross Volume)', value: '$0', trend: '0%', up: true, emoji: '💎', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Live Orders', value: '0', trend: '0%', up: true, emoji: '📦', color: 'bg-primary/5 text-primary border-primary/10' },
    { label: 'Active Fleet', value: '0', trend: '0%', up: true, emoji: '🛵', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Platform Partners', value: '0', trend: '0', up: true, emoji: '🏪', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  ];

  const chartData = [0, 0, 0, 0, 0, 0, 0]; // Empty chart for fresh state

  return (
    <AdminLayout active="overview">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">System Online</span>
          </div>
          <h1 className="font-lexend font-black text-5xl text-on-surface tracking-tight">Executive Dashboard</h1>
          <p className="text-on-surface-variant font-medium mt-3 text-lg flex items-center gap-2">
            Control Portal • <span className="text-primary">{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => {
            if(window.confirm('CRITICAL: Purge all system data? This will clear all restaurants, orders, and users. Action cannot be undone.')) {
              clearAllData();
            }
          }} className="px-6 py-3.5 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5} /></svg>
            Reset System
          </button>
          <button className="px-6 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            Refresh Metrics
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`glass-1 rounded-[32px] p-8 border-2 ${s.color} transition-all hover:-translate-y-1`}>
            <div className="flex justify-between items-start mb-6">
              <div className="text-3xl">{s.emoji}</div>
              <div className={`px-2 py-1 rounded-lg text-xs font-black ${s.up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {s.up ? '↑' : '↓'} {s.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <p className="font-lexend font-black text-4xl text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8 mb-10">
        {/* Activity Chart */}
        <div className="col-span-2 glass-1 rounded-[40px] p-10 border border-outline-variant/30 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="font-lexend font-black text-2xl text-on-surface">Order Velocity</h2>
              <p className="text-on-surface-variant text-sm font-medium mt-1">Platform performance last 7 days</p>
            </div>
            <select className="bg-surface-container border border-outline-variant rounded-xl px-4 py-2 font-bold text-xs outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-6 px-4">
            {chartData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="w-full relative">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {v} Orders
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-2xl transition-all duration-1000 ease-out group-hover:brightness-110 group-hover:shadow-lg group-hover:shadow-primary/30"
                    style={{ height: `${(v / 120) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="glass-1 rounded-[40px] p-10 border border-outline-variant/30">
          <h2 className="font-lexend font-black text-2xl text-on-surface mb-8">System Health</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-on-surface-variant">
                <span>CPU Load</span><span>12%</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[12%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-on-surface-variant">
                <span>Database</span><span>Latency: 4ms</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[5%]" />
              </div>
            </div>
            <div className="pt-6 border-t border-outline-variant/30">
              <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Urgent Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold text-sm hover:bg-red-100 transition-colors">
                  <span>Disputed Orders</span>
                  <span className="bg-red-700 text-white px-2 py-0.5 rounded-lg text-[10px]">0</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-primary/5 text-primary rounded-2xl border border-primary/10 font-bold text-sm hover:bg-primary/10 transition-colors">
                  <span>Pending Approvals</span>
                  <span className="bg-primary text-white px-2 py-0.5 rounded-lg text-[10px]">
                    {pendingOwners.filter(o => o.status === 'pending').length + pendingPartners.filter(p => p.status === 'pending').length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-1 rounded-[40px] p-10 border border-outline-variant/30 shadow-2xl shadow-charcoal/5">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-lexend font-black text-2xl text-on-surface">Global Order Log</h2>
          <button className="text-primary font-black text-xs uppercase tracking-[0.2em] hover:underline">View Transaction Ledger →</button>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-surface-container/30 rounded-[32px] border-2 border-dashed border-outline-variant">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-lexend font-bold text-xl text-on-surface-variant">No system-wide orders recorded</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-outline-variant/30">
            <table className="w-full">
              <thead className="bg-surface-container/50">
                <tr className="text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Order Reference</th>
                  <th className="px-6 py-5">Vendor</th>
                  <th className="px-6 py-5">Value</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 bg-white/50">
                {orders.map(o => (
                  <tr key={o.id} className="group hover:bg-white transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-lexend font-bold text-on-surface">#{o.id}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase">{new Date(o.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-on-surface">{o.restaurantName}</p>
                      <p className="text-xs text-on-surface-variant">Gourmet Delivery</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-lexend font-black text-primary">${o.total.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2.5 rounded-xl hover:bg-surface-container transition-colors">
                        <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" strokeWidth={2.5} /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
