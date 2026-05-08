import React, { useState } from 'react';
import { AdminLayout } from './AdminOverview';

const mockRestaurants = [
  { id: 'r1', name: 'The Velvet Bistro', cuisine: 'Modern European', status: 'active', revenue: '$12,450', rating: 4.9, orders: 340, joined: 'Jan 2024' },
  { id: 'r2', name: 'Zen Garden Sushi', cuisine: 'Japanese', status: 'active', revenue: '$9,210', rating: 4.8, orders: 210, joined: 'Mar 2024' },
  { id: 'r3', name: "L'Or Brasserie", cuisine: 'French', status: 'pending', revenue: '$0', rating: null, orders: 0, joined: 'May 2024' },
  { id: 'r4', name: 'Maison Rouge', cuisine: 'French Fusion', status: 'suspended', revenue: '$3,100', rating: 3.2, orders: 88, joined: 'Feb 2024' },
];

const STATUS: Record<string, { badge: string; label: string }> = {
  active:    { badge: 'badge-green',  label: 'Active' },
  pending:   { badge: 'badge-orange', label: 'Pending Review' },
  suspended: { badge: 'badge-red',    label: 'Suspended' },
};

export default function AdminRestaurants() {
  const [filter, setFilter] = useState('All');
  const tabs = ['All', 'Active', 'Pending', 'Suspended'];
  const filtered = filter === 'All' ? mockRestaurants : mockRestaurants.filter(r => r.status === filter.toLowerCase());

  return (
    <AdminLayout active="restaurants">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-lexend font-bold text-3xl text-on-surface">Restaurant Management</h1>
          <p className="text-on-surface-variant mt-1">{mockRestaurants.length} partner restaurants registered</p>
        </div>
        <button className="btn-primary rounded-xl px-5 py-2.5 text-sm">+ Onboard Partner</button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: mockRestaurants.length, color: 'text-on-surface' },
          { label: 'Active', value: mockRestaurants.filter(r => r.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Pending', value: mockRestaurants.filter(r => r.status === 'pending').length, color: 'text-primary' },
          { label: 'Suspended', value: mockRestaurants.filter(r => r.status === 'suspended').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="glass-1 rounded-2xl p-5 text-center">
            <p className={`font-lexend font-bold text-4xl ${s.color}`}>{s.value}</p>
            <p className="text-xs font-bold text-on-surface-variant uppercase mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${filter === t ? 'chip-active' : 'chip-inactive'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-1 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-outline-variant">
            <tr className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4">Restaurant</th>
              <th className="px-6 py-4">Cuisine</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4 text-right">Revenue</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtered.map(r => {
              const s = STATUS[r.status];
              return (
                <tr key={r.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-6 py-4 font-bold font-lexend text-on-surface">{r.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{r.cuisine}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{r.joined}</td>
                  <td className="px-6 py-4"><span className={s.badge}>{s.label}</span></td>
                  <td className="px-6 py-4 font-semibold">{r.orders}</td>
                  <td className="px-6 py-4 font-semibold">{r.rating ? `★ ${r.rating}` : '—'}</td>
                  <td className="px-6 py-4 font-bold text-primary text-right">{r.revenue}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === 'pending' && (
                        <button className="btn-primary px-3 py-1.5 rounded-lg text-xs">Approve</button>
                      )}
                      {r.status === 'suspended' && (
                        <button className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Reinstate</button>
                      )}
                      <button className="btn-secondary px-3 py-1.5 rounded-lg text-xs">View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
