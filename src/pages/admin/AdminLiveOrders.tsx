import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminOverview';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { Clock, MapPin, ChefHat, Bike, CheckCircle2 } from 'lucide-react';

export default function AdminLiveOrders() {
  const { orders, updateOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'delivering'>('all');

  // Auto-refresh simulation
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setTime(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  const filtered = orders.filter(o => activeTab === 'all' || o.status === activeTab).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'preparing': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'ready': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'delivering': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'ready': return <CheckCircle2 className="w-4 h-4" />;
      case 'delivering': return <Bike className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout active="orders">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-lexend font-black text-3xl tracking-tight text-charcoal">Live Orders Hub</h1>
          <p className="text-on-surface-variant font-medium mt-1">Real-time enterprise order tracking</p>
        </div>
        <div className="flex bg-surface-container p-1 rounded-xl w-max">
          {['all', 'pending', 'preparing', 'ready', 'delivering'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-on-surface-variant bg-surface-container/30 rounded-[32px] border border-dashed border-outline-variant">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-lexend font-bold text-xl mb-2">No Active Orders</h3>
            <p>The queue is currently clear in this category.</p>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="card-premium p-6 flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-black text-on-surface-variant tracking-wider uppercase">{order.id}</span>
                <h3 className="font-lexend font-bold text-lg text-on-surface leading-tight mt-1">{order.restaurantName}</h3>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs font-bold capitalize flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <div className="bg-surface-container/50 rounded-xl p-3">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Customer Details</p>
                <div className="flex items-center gap-2 text-sm font-medium text-on-surface mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{order.customerName?.charAt(0) || 'C'}</div>
                  {order.customerName || 'Guest'}
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface-variant mt-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{order.address}</span>
                </div>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-on-surface font-medium"><span className="text-primary font-bold">{item.quantity}x</span> {item.menuItem.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
              <div className="font-lexend font-black text-xl text-primary">${order.total.toFixed(2)}</div>
              
              {/* Manual Override Actions for Admin */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                  className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-bold text-charcoal outline-none cursor-pointer hover:border-primary transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivering">Delivering</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancel</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
