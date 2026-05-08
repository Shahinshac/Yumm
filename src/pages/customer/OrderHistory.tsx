import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-orange',
  accepted: 'badge-green',
  preparing: 'badge-green',
  ready: 'badge-green',
  delivering: 'badge-orange',
  delivered: 'badge-green',
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { orders } = useApp();

  return (
    <div className="mobile-frame bg-surface min-h-screen">
      <header className="sticky top-0 z-50 glass-3 pt-12 px-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="glass-1 w-10 h-10 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-lexend font-bold text-2xl">My Orders</h1>
      </header>

      <div className="px-6 py-5 pb-32 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🛍️</p>
            <p className="font-lexend font-bold text-xl">No orders yet</p>
            <p className="text-on-surface-variant mt-2">Your order history will appear here</p>
            <button onClick={() => navigate('/customer')} className="btn-primary mt-6">Browse Restaurants</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="glass-1 rounded-3xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-lexend font-bold text-lg text-on-surface">{order.restaurantName}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={STATUS_COLORS[order.status]}>{order.status}</span>
              </div>

              <div className="border-t border-outline-variant pt-3 pb-3 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-on-surface-variant">
                    <span>{item.quantity}× {item.menuItem.name}</span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-on-surface">Total</span>
                <span className="font-lexend font-bold text-primary">${order.total.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 btn-secondary rounded-xl py-3 text-sm">Reorder</button>
                {order.status !== 'delivered' && (
                  <button onClick={() => navigate(`/customer/track/${order.id}`)}
                    className="flex-1 btn-primary rounded-xl py-3 text-sm">Track Order</button>
                )}
                {order.status === 'delivered' && (
                  <button className="flex-1 bg-yellow-50 text-yellow-700 rounded-xl py-3 text-sm font-bold hover:bg-yellow-100 transition-colors">
                    ★ Rate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <MobileNav active="orders" />
    </div>
  );
}
