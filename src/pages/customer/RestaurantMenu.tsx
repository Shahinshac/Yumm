import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';
import { MenuItem, Portion } from '../../types';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants, addToCart, cartCount, cartTotal } = useApp();
  const restaurant = restaurants.find(r => r.id === id);
  const [portionItem, setPortionItem] = useState<MenuItem | null>(null);

  if (!restaurant) return (
    <div className="mobile-frame flex items-center justify-center min-h-screen">
      <p className="font-lexend font-bold text-xl">Restaurant not found.</p>
    </div>
  );

  const handleAddToCart = (item: MenuItem, portion?: Portion) => {
    addToCart(item, portion);
    if (portion) setPortionItem(null);
  };

  return (
    <div className="app-container bg-surface min-h-screen">
      {/* Hero */}
      <div className="relative h-72 md:h-96">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#281812]/90 via-[#281812]/40 to-transparent" />
        
        <header className="absolute top-0 left-0 right-0 pt-12 px-6 md:px-12 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)}
            className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <h1 className="font-lexend font-bold text-3xl md:text-5xl text-white leading-tight mb-2">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">{restaurant.cuisine}</span>
            <span className="text-white/80 text-sm font-bold">★ {restaurant.rating}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:grid md:grid-cols-12 md:gap-12 pb-32">
        <div className="md:col-span-8">
          <h2 className="font-lexend font-black text-2xl text-on-surface mb-8">Culinary Menu</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {restaurant.menu.map(item => (
              <div key={item.id} className="glass-1 rounded-[32px] p-6 flex flex-col gap-4 border border-outline-variant/20 hover:border-primary/30 transition-all group">
                <div className="relative h-44 rounded-2xl overflow-hidden mb-2">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <h3 className="font-lexend font-black text-lg text-on-surface truncate pr-2">{item.name}</h3>
                  <p className="font-lexend font-black text-primary">${item.price.toFixed(2)}</p>
                </div>
                <p className="text-on-surface-variant text-xs line-clamp-2 font-medium">{item.description}</p>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-outline-variant/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    {item.hasPortions ? 'Multiple Portions' : 'Standard size'}
                  </span>
                  <button 
                    onClick={() => item.hasPortions ? setPortionItem(item) : handleAddToCart(item)}
                    className="btn-primary px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Add +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-12 glass-1 rounded-[40px] p-8 border border-outline-variant/30">
            <h3 className="font-lexend font-black text-xl mb-6">Your Basket</h3>
            {cartCount === 0 ? (
              <div className="py-8 text-center opacity-30">
                <p className="text-4xl mb-2">🛒</p>
                <p className="text-[10px] font-black uppercase tracking-widest">No items selected</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-outline-variant/20 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Subtotal</span>
                  <span className="font-lexend font-black text-2xl text-primary">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => navigate('/customer/cart')} className="w-full btn-primary py-4 rounded-2xl font-bold">
                  Review & Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {portionItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-xl" onClick={() => setPortionItem(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="font-lexend font-black text-2xl text-on-surface mb-6">Select Portion</h2>
            <div className="space-y-3">
              {portionItem.portions?.map(p => (
                <button 
                  key={p.label} 
                  onClick={() => handleAddToCart(portionItem, p)}
                  className="w-full flex justify-between items-center p-4 rounded-2xl bg-surface-container/50 hover:bg-primary/5 border-2 border-transparent hover:border-primary transition-all group"
                >
                  <span className="font-lexend font-black text-on-surface">{p.label}</span>
                  <span className="font-lexend font-black text-primary">${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPortionItem(null)} className="w-full mt-6 text-on-surface-variant font-bold text-xs uppercase tracking-widest hover:underline">
              Close
            </button>
          </div>
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed bottom-24 left-6 right-6 z-50 md:hidden">
          <button onClick={() => navigate('/customer/cart')} className="w-full btn-primary px-6 py-4 rounded-2xl flex justify-between items-center shadow-2xl">
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-black">{cartCount}</span>
            <span className="font-bold">Basket</span>
            <span className="font-lexend font-black">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className="md:hidden">
        <MobileNav active="home" />
      </div>
    </div>
  );
}
