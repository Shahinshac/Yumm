import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';
import type { MenuItem, Portion } from '../../types';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants, addToCart, cartCount, cartTotal } = useApp();
  const restaurant = restaurants.find(r => r.id === id);

  const [portionItem, setPortionItem] = useState<MenuItem | null>(null);

  if (!restaurant) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-surface">
      <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center text-6xl mb-6 animate-bounce">🍽️</div>
      <h2 className="font-lexend font-bold text-3xl text-on-surface">Restaurant not found</h2>
      <p className="text-on-surface-variant mt-3 max-w-xs mx-auto">We couldn't find the gourmet establishment you're looking for.</p>
      <button onClick={() => navigate('/customer')} className="btn-primary mt-8 px-10 py-4 rounded-2xl">Explore Others</button>
    </div>
  );

  const handleAddToCart = (item: MenuItem, portion?: Portion) => {
    addToCart(item, portion);
    setPortionItem(null);
  };

  return (
    <div className="bg-surface min-h-screen pb-32">
      <div className="relative h-72 md:h-96">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-charcoal/20 to-transparent" />
        <button onClick={() => navigate(-1)} 
          className="absolute top-14 left-6 glass-3 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="relative -mt-20 z-10 px-6">
        <div className="glass-3 rounded-[40px] p-8 shadow-2xl shadow-charcoal/20 border border-white/40">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-lexend font-bold text-4xl text-on-surface tracking-tight">{restaurant.name}</h1>
              <p className="text-on-surface-variant text-lg mt-1">{restaurant.cuisine} • {restaurant.deliveryTime} • {restaurant.deliveryFee} fee</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
              <span className="text-primary text-xl">★</span>
              <span className="font-bold text-xl text-on-surface">{restaurant.rating}</span>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {['All', 'Popular', 'Main Course', 'Desserts', 'Drinks'].map(cat => (
              <button key={cat} className="flex-shrink-0 px-6 py-2.5 rounded-full border border-outline-variant text-sm font-bold hover:border-primary transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mt-10 space-y-10">
        <section>
          <h2 className="font-lexend font-bold text-2xl text-on-surface mb-6 px-2">Featured Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurant.menu.map(item => (
              <div key={item.id} className="glass-1 rounded-[32px] p-5 flex gap-5 border border-outline-variant/20 hover:shadow-2xl transition-all duration-500 group">
                <div className="relative w-32 h-32 rounded-[24px] overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  {item.isVeg && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-md border border-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                  )}
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-lexend font-bold text-xl text-on-surface">{item.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-lexend font-black text-2xl text-primary">${item.price.toFixed(2)}</p>
                    <button 
                      onClick={() => item.hasPortions ? setPortionItem(item) : handleAddToCart(item)}
                      className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform active:scale-95">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {portionItem && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center px-6 pb-10">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-md" onClick={() => setPortionItem(null)} />
          <div className="relative w-full max-w-md bg-surface rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-lexend font-bold text-2xl text-on-surface">{portionItem.name}</h3>
                <p className="text-on-surface-variant text-sm mt-1">Select your preferred portion size</p>
              </div>
              <button onClick={() => setPortionItem(null)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} strokeLinecap="round" /></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {(portionItem.portions || []).map(p => (
                <button key={p.label} onClick={() => handleAddToCart(portionItem, p)}
                  className="flex flex-col items-center p-6 rounded-3xl border-2 border-outline-variant hover:border-primary hover:bg-primary/5 transition-all group">
                  <span className="text-2xl mb-2">{p.label === '1/4' ? '🥣' : p.label === '1/2' ? '🍲' : p.label === '3/4' ? '🍛' : '🥘'}</span>
                  <span className="font-lexend font-bold text-lg text-on-surface">{p.label}</span>
                  <span className="text-primary font-black mt-1">${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            
            <p className="text-center text-on-surface-variant text-xs font-medium">Standard premium ingredients included</p>
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-6 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent md:hidden">
          <div className="max-w-md mx-auto">
            <button onClick={() => navigate('/customer/cart')}
              className="w-full btn-primary rounded-3xl py-5 px-8 flex items-center justify-between shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center font-bold">{cartCount}</div>
                <span className="font-lexend font-bold text-lg">View Gourmet Cart</span>
              </div>
              <span className="font-lexend font-bold text-xl">${cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <MobileNav active="none" />
      </div>
      <div className="md:hidden">
        <MobileNav active="none" />
      </div>
    </div>
  );
}
