import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const TABS = ['All', 'Pending', 'Preparing', 'Ready', 'Delivering', 'Delivered'];

function OwnerNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Dashboard', emoji: '📊', path: '/owner' },
    { id: 'orders', label: 'Orders', emoji: '📦', path: '/owner/orders' },
    { id: 'menu', label: 'Menu', emoji: '📋', path: '/owner' },
    { id: 'analytics', label: 'Analytics', emoji: '📈', path: '/owner' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-3 border-t border-outline-variant">
      <div className="max-w-[780px] mx-auto flex justify-around items-center px-4 py-3">
        {items.map(item => (
          <button key={item.id} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors
              ${active === item.id ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="text-xl">{item.emoji}</span>
            <span className={`text-xs font-bold ${active === item.id ? 'font-bold' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter(o => !['delivered'].includes(o.status));

  return (
    <div className="bg-surface min-h-screen max-w-[780px] mx-auto pb-28">
      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-10 pb-8"
        style={{ background: 'linear-gradient(135deg, #281812 0%, #5c4037 100%)' }}>
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Partner Portal</p>
            <h1 className="font-lexend font-bold text-3xl text-white mt-1">The Velvet Bistro</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-bold">Open · Accepting orders</span>
            </div>
          </div>
          <button onClick={() => navigate('/login')}
            className="glass-1 px-3 py-2 rounded-xl text-white text-sm font-bold">Sign Out</button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
          {[
            { label: "Today's Orders", value: orders.length },
            { label: 'Active', value: activeOrders.length },
            { label: 'Revenue', value: `$${revenue.toFixed(0)}` },
          ].map(s => (
            <div key={s.label} className="glass-1 rounded-2xl p-4 text-center">
              <p className="font-lexend font-bold text-2xl text-white">{s.value}</p>
              <p className="text-xs text-white/60 font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* Quick Actions */}
        <div>
          <h2 className="font-lexend font-bold text-xl mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/owner/orders')}
              className="btn-primary rounded-2xl py-4 flex items-center justify-center gap-2 text-base">
              📦 Manage Orders
            </button>
            <button className="btn-secondary rounded-2xl py-4 flex items-center justify-center gap-2 text-base font-bold">
              📋 Edit Menu
            </button>
          </div>
        </div>

        {/* Incoming orders */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-lexend font-bold text-xl">
              Incoming Orders
              {pendingOrders.length > 0 && (
                <span className="ml-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
              )}
            </h2>
            <button onClick={() => navigate('/owner/orders')} className="text-primary font-bold text-sm">View all</button>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="glass-1 rounded-3xl p-8 text-center">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-bold text-lg text-on-surface">All caught up!</p>
              <p className="text-on-surface-variant text-sm mt-1">No pending orders right now</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="glass-2 rounded-3xl p-5 border-l-4 border-primary">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-lexend font-bold text-lg">Order #{order.id}</p>
                      <p className="text-sm text-on-surface-variant mt-0.5">{order.items.length} items · {order.address}</p>
                    </div>
                    <span className="font-lexend font-bold text-2xl text-primary">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 mb-4 border-t border-outline-variant pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-on-surface-variant">
                        <span>{item.quantity}× {item.menuItem.name}</span>
                        <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-[2] btn-primary rounded-xl py-3 text-sm">✓ Accept & Start Preparing</button>
                    <button className="flex-1 border border-red-200 text-red-500 rounded-xl py-3 text-sm font-bold hover:bg-red-50 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance snapshot */}
        <div>
          <h2 className="font-lexend font-bold text-xl mb-3">Today's Performance</h2>
          <div className="glass-1 rounded-3xl p-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Avg Prep Time', value: '18 min', icon: '⏱️' },
              { label: 'Customer Rating', value: '★ 4.9', icon: '⭐' },
              { label: 'Completion Rate', value: '98%', icon: '✅' },
              { label: 'Cancellations', value: '1', icon: '❌' },
            ].map(m => (
              <div key={m.label} className="bg-surface-container rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase">{m.label}</p>
                  <p className="font-lexend font-bold text-xl">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OwnerNav active="dashboard" />
    </div>
  );
}
