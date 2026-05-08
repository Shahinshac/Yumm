import React, { useState } from 'react';
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
    <aside className="w-64 min-h-screen flex flex-col gap-1 p-5 border-r border-outline-variant bg-white/50 backdrop-blur-md fixed top-0 left-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-lexend font-black text-lg">N</div>
        <div>
          <p className="font-lexend font-bold text-lg text-on-surface leading-none">NexFood</p>
          <p className="text-xs text-on-surface-variant">Admin Suite</p>
        </div>
      </div>

      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-2">Platform</p>

      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => navigate(item.path)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-150 text-left
            ${active === item.id
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'text-on-surface hover:bg-surface-container'}`}>
          <span className="text-lg">{item.emoji}</span>
          <span className="flex-1">{item.label}</span>
          {item.id === 'approvals' && pendingCount > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active === 'approvals' ? 'bg-white/30 text-white' : 'bg-primary text-white'}`}>
              {pendingCount}
            </span>
          )}
        </button>
      ))}

      <div className="mt-auto pt-4 border-t border-outline-variant">
        <button onClick={() => navigate('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-semibold transition-colors">
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSidebar active={active} />
      <main className="ml-64 flex-1 p-8 min-h-screen">{children}</main>
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────────────────────
export function AdminOverview() {
  const { orders, restaurants } = useApp();
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Total Orders', value: orders.length, trend: '+12%', up: true, emoji: '📦', color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Partners', value: restaurants.length, trend: '+3', up: true, emoji: '🏪', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Drivers', value: 142, trend: '-2%', up: false, emoji: '🛵', color: 'bg-orange-50 text-orange-600' },
    { label: 'Platform Revenue', value: `$${revenue.toFixed(0)}`, trend: '+18%', up: true, emoji: '💰', color: 'bg-purple-50 text-purple-600' },
    { label: 'Open Disputes', value: 4, trend: '-1', up: true, emoji: '⚖️', color: 'bg-red-50 text-red-600' },
    { label: 'Avg Delivery', value: '32 min', trend: '-4 min', up: true, emoji: '⏱️', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <AdminLayout active="overview">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-lexend font-bold text-3xl text-on-surface">System Overview</h1>
          <p className="text-on-surface-variant mt-1">Welcome back, Administrator · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-bold">↓ Export</button>
          <button className="btn-primary rounded-xl px-4 py-2.5 text-sm">⚙ Settings</button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass-1 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${s.color}`}>{s.emoji}</div>
              <span className={`text-sm font-bold ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>{s.trend}</span>
            </div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
            <p className="font-lexend font-bold text-4xl text-on-surface mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Map + Alerts */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 glass-1 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-lexend font-bold text-xl">Live Operations Map</h2>
            <span className="badge-green flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" /> Live</span>
          </div>
          <div className="bg-surface-container rounded-2xl h-64 flex flex-col items-center justify-center border border-outline-variant relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')] bg-cover grayscale" />
            <div className="relative text-center">
              <p className="text-5xl mb-2">🗺️</p>
              <p className="font-bold text-on-surface-variant">Real-time driver tracking</p>
              <p className="text-sm text-on-surface-variant mt-1">142 drivers active across 8 zones</p>
            </div>
          </div>
        </div>

        <div className="glass-1 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-lexend font-bold text-xl">Pending Registrations</h2>
            <button onClick={() => navigate('/admin/approvals')} className="text-primary font-bold text-xs">View all</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧑‍🍳</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">Restaurants</p>
                  <p className="text-xs text-on-surface-variant">Awaiting review</p>
                </div>
              </div>
              <span className="font-lexend font-bold text-xl text-blue-600">{pendingOwners.filter(o => o.status === 'pending').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛵</span>
                <div>
                  <p className="text-sm font-bold text-on-surface">Partners</p>
                  <p className="text-xs text-on-surface-variant">Applications</p>
                </div>
              </div>
              <span className="font-lexend font-bold text-xl text-emerald-600">{pendingPartners.filter(p => p.status === 'pending').length}</span>
            </div>
          </div>

          <h2 className="font-lexend font-bold text-xl mb-4 mt-8">System Alerts</h2>
          <div className="space-y-3">
            {[
              { type: 'error', icon: '🔴', title: 'High delivery time', body: 'Zone B: 45m+ delays' },
              { type: 'warn', icon: '🟡', title: 'Driver shortage', body: 'Need 15 more Downtown' },
              { type: 'info', icon: '🔵', title: 'New dispute', body: 'Order #4821 flagged' },
            ].map((a, i) => (
              <div key={i} className={`p-3 rounded-2xl border ${
                a.type === 'error' ? 'bg-red-50 border-red-100' :
                a.type === 'warn' ? 'bg-yellow-50 border-yellow-100' :
                'bg-blue-50 border-blue-100'}`}>
                <p className="font-bold text-sm">{a.icon} {a.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="glass-1 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-lexend font-bold text-xl">Recent Platform Orders</h2>
          <button className="text-primary font-bold text-sm">View all →</button>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">
            No orders yet. Place an order from the Customer app to see them here.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <th className="pb-3">Order ID</th><th className="pb-3">Restaurant</th>
                <th className="pb-3">Customer</th><th className="pb-3">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {orders.map(o => (
                <tr key={o.id} className="text-sm hover:bg-surface-container/50 transition-colors">
                  <td className="py-3 font-bold font-lexend text-primary">{o.id}</td>
                  <td className="py-3 text-on-surface">{o.restaurantName}</td>
                  <td className="py-3 text-on-surface-variant">sophia@nexfood.com</td>
                  <td className="py-3"><span className="badge-orange capitalize">{o.status}</span></td>
                  <td className="py-3 font-bold text-on-surface text-right">${o.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
