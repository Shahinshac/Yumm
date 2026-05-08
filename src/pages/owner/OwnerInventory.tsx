import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { PortionLabel } from '../../types';

function OwnerNav({ active }: { active: string }) {
  const navigate = useNavigate();
  const items = [
    { id: 'dashboard', label: 'Overview', emoji: '📊', path: '/owner' },
    { id: 'orders', label: 'Orders', emoji: '📦', path: '/owner/orders' },
    { id: 'menu', label: 'Inventory', emoji: '📋', path: '/owner/inventory' },
    { id: 'analytics', label: 'Revenue', emoji: '📈', path: '/owner/inventory' },
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

export default function OwnerInventory() {
  const { restaurants, currentUser, addMenuItem, removeMenuItem } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    fullPrice: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
    isVeg: true,
    hasPortions: false,
    portions: {
      '1/4': 0,
      '1/2': 0,
      '3/4': 0,
      'FULL': 0
    }
  });

  const restaurant = restaurants.find(r => r.ownerId === currentUser?.id);

  // Auto-calculate portions when full price changes
  useEffect(() => {
    const price = parseFloat(newItem.fullPrice);
    if (!isNaN(price) && newItem.hasPortions) {
      setNewItem(prev => ({
        ...prev,
        portions: {
          '1/4': parseFloat((price * 0.35).toFixed(2)), // slightly higher than proportional for small sizes
          '1/2': parseFloat((price * 0.60).toFixed(2)),
          '3/4': parseFloat((price * 0.85).toFixed(2)),
          'FULL': price
        }
      }));
    }
  }, [newItem.fullPrice, newItem.hasPortions]);

  if (!restaurant) return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-8 text-center">
      <div className="animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-surface-container rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🏪</div>
        <h1 className="font-lexend font-black text-3xl text-on-surface tracking-tight">No Restaurant Linked</h1>
        <p className="text-on-surface-variant mt-3 max-w-xs mx-auto font-medium">Your account needs to be associated with a restaurant by the administrator.</p>
        <button onClick={() => navigate('/login')} className="btn-primary mt-10 px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all">Return to Hub</button>
      </div>
    </div>
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.fullPrice),
      imageUrl: newItem.imageUrl,
      category: 'General',
      isVeg: newItem.isVeg,
      hasPortions: newItem.hasPortions,
      portions: newItem.hasPortions ? [
        { label: '1/4' as PortionLabel, price: newItem.portions['1/4'] },
        { label: '1/2' as PortionLabel, price: newItem.portions['1/2'] },
        { label: '3/4' as PortionLabel, price: newItem.portions['3/4'] },
        { label: 'FULL' as PortionLabel, price: newItem.portions['FULL'] },
      ] : undefined
    };
    addMenuItem(restaurant.id, itemData);
    setNewItem({ 
      name: '', description: '', fullPrice: '', 
      imageUrl: newItem.imageUrl, isVeg: true, 
      hasPortions: false, 
      portions: { '1/4': 0, '1/2': 0, '3/4': 0, 'FULL': 0 } 
    });
    setShowAdd(false);
  };

  return (
    <div className="bg-surface min-h-screen pb-32">
      <header className="pt-20 px-8 max-w-5xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Kitchen Intel</span>
              <span className="w-1 h-1 bg-on-surface-variant/30 rounded-full" />
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{restaurant.name}</span>
            </div>
            <h1 className="font-lexend font-black text-6xl text-on-surface tracking-tighter leading-none mb-2">Inventory</h1>
            <p className="text-on-surface-variant font-medium text-lg">Curating your gourmet menu for {restaurant.reviewCount} diners</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary px-10 py-5 rounded-[28px] shadow-2xl shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3 group">
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
            <span className="font-lexend font-black text-xs uppercase tracking-widest">New Culinary Creation</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {restaurant.menu.length === 0 ? (
            <div className="lg:col-span-2 py-24 text-center glass-1 rounded-[56px] border border-dashed border-outline-variant/50">
              <div className="text-7xl mb-8 opacity-20">🎨</div>
              <h3 className="font-lexend font-black text-3xl text-on-surface mb-2">The Canvas is Empty</h3>
              <p className="text-on-surface-variant font-medium max-w-sm mx-auto mb-10">Add your first dish to start welcoming diners to your kitchen.</p>
              <button onClick={() => setShowAdd(true)} className="text-primary font-black uppercase tracking-[0.3em] text-xs hover:underline">Begin Onboarding Items</button>
            </div>
          ) : (
            restaurant.menu.map((item, idx) => (
              <div key={item.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="glass-1 rounded-[48px] overflow-hidden border border-outline-variant/30 group hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-2xl">
                  <div className="relative h-48">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 flex gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20
                        ${item.isVeg ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <h3 className="font-lexend font-black text-2xl text-white tracking-tight truncate flex-1">{item.name}</h3>
                      <p className="font-lexend font-black text-3xl text-primary">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-6 line-clamp-2">{item.description}</p>
                    
                    {item.hasPortions && (
                      <div className="bg-surface-container/50 rounded-3xl p-5 mb-6 grid grid-cols-4 gap-2">
                        {item.portions?.map(p => (
                          <div key={p.label} className="text-center">
                            <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-1">{p.label}</p>
                            <p className="font-lexend font-black text-xs text-on-surface">${p.price.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active on Menu</span>
                      </div>
                      <button onClick={() => removeMenuItem(restaurant.id, item.id)} className="text-on-surface-variant/40 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-colors hover:underline">Decommission Item</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowAdd(false)} />
          <form onSubmit={handleAdd} className="relative w-full max-w-2xl bg-surface rounded-[56px] p-12 shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto scrollbar-hide border border-white/10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="font-lexend font-black text-4xl text-on-surface tracking-tight mb-2">Define Dish</h2>
                <p className="text-on-surface-variant font-medium">Craft the details of your next culinary masterpiece</p>
              </div>
              <button type="button" onClick={() => setShowAdd(false)} className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-2xl hover:rotate-90 transition-transform">×</button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-2">Dish Identity</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                    className="w-full bg-surface-container border-none rounded-3xl px-6 py-4.5 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. Saffron Infused Sea Bass" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-2">Standard Price (Full)</label>
                  <input required type="number" step="0.01" value={newItem.fullPrice} onChange={e => setNewItem({...newItem, fullPrice: e.target.value})}
                    className="w-full bg-surface-container border-none rounded-3xl px-6 py-4.5 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-4 bg-surface-container/30 p-8 rounded-[40px] border border-outline-variant/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-lexend font-black text-lg text-on-surface">Portion Logic</h4>
                    <p className="text-on-surface-variant text-xs font-medium">Enable fractional quantities (1/4, 1/2, 3/4)</p>
                  </div>
                  <button type="button" onClick={() => setNewItem({...newItem, hasPortions: !newItem.hasPortions})}
                    className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center px-1
                      ${newItem.hasPortions ? 'bg-primary' : 'bg-on-surface-variant/20'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500 ${newItem.hasPortions ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {newItem.hasPortions && (
                  <div className="grid grid-cols-4 gap-4 mt-6 animate-in slide-in-from-top duration-500">
                    {Object.entries(newItem.portions).map(([label, price]) => (
                      <div key={label} className="space-y-2">
                        <label className="text-[9px] font-black text-center block uppercase tracking-widest text-on-surface-variant">{label}</label>
                        <input type="number" step="0.01" value={price} onChange={e => setNewItem({
                          ...newItem,
                          portions: { ...newItem.portions, [label]: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full bg-white border border-outline-variant/30 rounded-2xl px-3 py-3 text-center font-bold text-sm text-on-surface focus:border-primary transition-all outline-none" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-2">Description</label>
                <textarea required rows={3} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-surface-container border-none rounded-3xl px-6 py-5 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" placeholder="Describe the soul of this dish..." />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} className="hidden" />
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newItem.isVeg ? 'bg-green-500 border-green-500' : 'border-outline-variant'}`}>
                    {newItem.isVeg && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Vegetarian Dish</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-5 rounded-[24px] border border-outline-variant/40 text-on-surface-variant font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">Cancel Draft</button>
              <button type="submit" className="flex-2 btn-primary py-5 rounded-[24px] shadow-2xl shadow-primary/30 flex-1">Publish to Live Menu</button>
            </div>
          </form>
        </div>
      )}

      <OwnerNav active="menu" />
    </div>
  );
}
