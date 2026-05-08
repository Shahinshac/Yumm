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
            <span className={`text-xs font-bold`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function OwnerOrders() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="bg-surface min-h-screen max-w-[780px] mx-auto pb-28">
      <header className="sticky top-0 z-50 glass-3 px-6 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="glass-1 w-10 h-10 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-lexend font-bold text-2xl">Order Management</h1>
          <p className="text-on-surface-variant text-sm">{orders.length} total orders</p>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map(t => {
            const count = t === 'All' ? orders.length : orders.filter(o => o.status.toLowerCase() === t.toLowerCase()).length;
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex-shrink-0 flex items-center gap-1.5 transition-all duration-200 ${activeTab === t ? 'chip-active' : 'chip-inactive'}`}>
                {t}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t ? 'bg-white/30 text-white' : 'bg-outline-variant text-on-surface-variant'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      <div className="p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-bold text-lg">No {activeTab.toLowerCase()} orders</p>
          </div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className={`glass-1 rounded-3xl p-5 border-l-4 transition-all
              ${order.status === 'pending' ? 'border-primary' :
                order.status === 'preparing' ? 'border-blue-500' :
                order.status === 'ready' ? 'border-emerald-500' :
                order.status === 'delivering' ? 'border-orange-500' : 'border-outline-variant'}`}>

              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-lexend font-bold text-lg">#{order.id}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {order.address} · {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-lexend font-bold text-xl text-primary">${order.total.toFixed(2)}</span>
                  <div className="mt-1">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize
                      ${order.status === 'pending' ? 'bg-primary/10 text-primary' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'delivering' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-outline-variant pt-3 pb-3 space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-on-surface font-medium">{item.quantity}× {item.menuItem.name}</span>
                    <span className="text-on-surface-variant">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-3">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-[2] btn-primary rounded-xl py-3 text-sm">✓ Accept Order</button>
                    <button className="flex-1 border border-red-200 text-red-500 rounded-xl py-3 text-sm font-bold hover:bg-red-50 transition-colors">Reject</button>
                  </>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                    ✓ Mark Ready for Pickup
                  </button>
                )}
                {order.status === 'ready' && (
                  <div className="w-full glass-1 rounded-xl py-3 text-center text-emerald-600 font-bold text-sm">
                    ✓ Waiting for Driver Pickup
                  </div>
                )}
                {(order.status === 'delivering' || order.status === 'delivered') && (
                  <div className="w-full glass-1 rounded-xl py-3 text-center text-on-surface-variant font-bold text-sm capitalize">
                    {order.status === 'delivering' ? '🛵 Out for Delivery' : '✅ Delivered'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <OwnerNav active="orders" />
    </div>
  );
}
