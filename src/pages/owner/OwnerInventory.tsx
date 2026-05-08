import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

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
    price: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
    isVeg: true
  });

  const restaurant = restaurants.find(r => r.ownerId === currentUser?.id);

  if (!restaurant) return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-4xl mb-4">🏪</p>
        <h1 className="font-lexend font-black text-2xl text-on-surface">No Restaurant Linked</h1>
        <p className="text-on-surface-variant mt-2 max-w-xs">Your account needs to be associated with a restaurant by the administrator.</p>
        <button onClick={() => navigate('/login')} className="btn-primary mt-8 px-8 py-3 rounded-2xl">Return to Login</button>
      </div>
    </div>
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMenuItem(restaurant.id, {
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      imageUrl: newItem.imageUrl,
      isVeg: newItem.isVeg
    });
    setNewItem({ name: '', description: '', price: '', imageUrl: newItem.imageUrl, isVeg: true });
    setShowAdd(false);
  };

  return (
    <div className="bg-surface min-h-screen pb-32">
      <header className="pt-16 px-8 max-w-4xl mx-auto mb-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Gourmet Inventory</p>
            <h1 className="font-lexend font-black text-5xl text-on-surface tracking-tight">Menu Manager</h1>
            <p className="text-on-surface-variant font-medium mt-2">Managing {restaurant.menu.length} culinary masterpieces</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            + Add New Item
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {restaurant.menu.map(item => (
          <div key={item.id} className="glass-1 rounded-[40px] p-6 border border-outline-variant/30 flex gap-6 group hover:border-primary/30 transition-all">
            <div className="w-28 h-28 rounded-[24px] overflow-hidden flex-shrink-0 shadow-lg">
              <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex justify-between items-start">
                <h3 className="font-lexend font-black text-xl text-on-surface truncate">{item.name}</h3>
                <span className="font-lexend font-black text-xl text-primary">${item.price.toFixed(2)}</span>
              </div>
              <p className="text-on-surface-variant text-xs mt-1 line-clamp-2">{item.description}</p>
              <div className="mt-auto pt-4 flex justify-between items-center">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {item.isVeg ? 'Vegetarian' : 'Non-Veg'}
                </span>
                <button onClick={() => removeMenuItem(restaurant.id, item.id)} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:underline">Remove Item</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <form onSubmit={handleAdd} className="relative w-full max-w-lg bg-white rounded-[48px] p-10 shadow-2xl animate-scale-up">
            <h2 className="font-lexend font-black text-3xl text-on-surface mb-2">New Culinary Item</h2>
            <p className="text-on-surface-variant mb-8 font-medium">Define the details of your new menu offering</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Dish Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-surface-container border-none rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="e.g. Truffle Infused Risotto" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Price ($)</label>
                  <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full bg-surface-container border-none rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="24.99" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Type</label>
                  <select value={newItem.isVeg ? 'veg' : 'non-veg'} onChange={e => setNewItem({...newItem, isVeg: e.target.value === 'veg'})}
                    className="w-full bg-surface-container border-none rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none">
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-2">Description</label>
                <textarea required rows={3} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full bg-surface-container border-none rounded-2xl px-6 py-4 font-bold text-on-surface focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none" placeholder="Describe the flavors, ingredients, and soul of this dish..." />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 rounded-2xl border border-outline-variant text-on-surface-variant font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl shadow-xl shadow-primary/20">Publish Item</button>
            </div>
          </form>
        </div>
      )}

      <OwnerNav active="menu" />
    </div>
  );
}
