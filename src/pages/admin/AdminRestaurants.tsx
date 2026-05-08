import React, { useState } from 'react';
import { AdminLayout } from './AdminOverview';
import { useApp } from '../../context/AppContext';

const STATUS: Record<string, { badge: string; label: string }> = {
  active:    { badge: 'badge-green',  label: 'Active' },
  pending:   { badge: 'badge-orange', label: 'Pending Review' },
  suspended: { badge: 'badge-red',    label: 'Suspended' },
};

export default function AdminRestaurants() {
  const { restaurants } = useApp();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const tabs = ['All', 'Active', 'Pending', 'Suspended'];
  
  const filtered = restaurants
    .filter(r => filter === 'All' || (r as any).status === filter.toLowerCase())
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout active="restaurants">
      <header className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Merchant Ecosystem</span>
          </div>
          <h1 className="font-lexend font-black text-5xl text-on-surface tracking-tight">Partners</h1>
          <p className="text-on-surface-variant font-medium mt-2">{restaurants.length} certified gourmet outlets</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
            <input type="text" placeholder="Search merchants..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white border border-outline-variant/50 rounded-2xl pl-12 pr-6 py-3.5 text-sm font-bold w-64 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all" />
          </div>
          <button className="btn-primary rounded-2xl px-8 py-3.5 text-sm shadow-xl shadow-primary/20">+ Onboard Partner</button>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Outlets', value: restaurants.length, icon: '🏪', bg: 'bg-charcoal text-white' },
          { label: 'Market Share', value: '0%', icon: '📈', bg: 'bg-white text-on-surface' },
          { label: 'Avg CSAT', value: '0.0', icon: '★', bg: 'bg-white text-on-surface' },
          { label: 'Pending Approvals', value: restaurants.filter(r => (r as any).status === 'pending').length, icon: '⏳', bg: 'bg-primary/5 text-primary' },
        ].map(s => (
          <div key={s.label} className={`rounded-[32px] p-6 border border-outline-variant/30 flex items-center gap-5 transition-all hover:shadow-2xl hover:shadow-charcoal/5 ${s.bg}`}>
            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-2xl">{s.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{s.label}</p>
              <p className="font-lexend font-black text-2xl">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === t ? 'bg-charcoal text-white shadow-lg' : 'bg-surface-container/50 text-on-surface-variant hover:bg-surface-container'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
          <span>Sort by:</span>
          <select className="bg-transparent font-black text-charcoal outline-none">
            <option>Recently Joined</option>
            <option>Highest Rated</option>
            <option>Top Revenue</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="glass-1 rounded-[48px] p-32 text-center border-2 border-dashed border-outline-variant/30">
          <div className="w-32 h-32 bg-primary/5 rounded-[48px] flex items-center justify-center text-6xl mx-auto mb-8 grayscale opacity-30">🏪</div>
          <h2 className="font-lexend font-black text-3xl text-on-surface mb-3">The Marketplace is Empty</h2>
          <p className="text-on-surface-variant max-w-sm mx-auto font-medium text-lg leading-relaxed">
            Welcome to your fresh deployment. Start by onboarding your first gourmet partner to activate the ecosystem.
          </p>
          <button className="btn-primary mt-10 px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all">
            Begin Onboarding Protocol
          </button>
        </div>
      ) : (
        <div className="glass-1 rounded-[40px] overflow-hidden border border-outline-variant/30">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30 bg-surface-container/30">
                <th className="px-10 py-6">Merchant Identity</th>
                <th className="px-10 py-6">Operational Status</th>
                <th className="px-10 py-6">Performance Index</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map(r => {
                const s = STATUS[(r as any).status] || STATUS.active;
                return (
                  <tr key={r.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white shadow-xl group-hover:rotate-3 transition-transform">
                          <img src={r.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-lexend font-black text-xl text-charcoal">{r.name}</p>
                          <p className="text-xs font-bold text-on-surface-variant mt-0.5">{r.cuisine} • {r.reviewCount} Reviews</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`${s.badge} px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest`}>{s.label}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-10">
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Rating</p>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-lg">★</span>
                            <span className="font-lexend font-black">{r.rating}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none mb-1">Volume</p>
                          <p className="font-lexend font-black">0 Orders</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center hover:bg-charcoal hover:text-white transition-all shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2}/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth={2}/></svg>
                        </button>
                        <button className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-primary/20">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2.5}/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
