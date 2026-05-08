import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

  const [portionItem, setPortionItem] = React.useState<MenuItem | null>(null);

  return (
    <div className="app-container bg-surface min-h-screen">
      {/* ... Hero same ... */}
      <div className="relative h-72 md:h-96">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#281812]/90 via-[#281812]/40 to-transparent" />
        
        <header className="absolute top-0 left-0 right-0 pt-12 px-6 md:px-12 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)}
            className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-on-surface md:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex gap-3">
            <button className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-lexend font-bold text-3xl md:text-5xl text-white leading-tight"
                style={{ textShadow: '0 2px 12px rgba(40,24,18,0.6)' }}>
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <p className="text-white/90 font-bold bg-primary/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">{restaurant.cuisine}</p>
                <div className="flex items-center gap-1 text-white">
                  <span className="text-yellow-400">★</span>
                  <span className="font-bold">{restaurant.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-12 px-6 md:px-12 py-8 md:py-12 pb-32">
        <div className="md:col-span-8">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/30">
            <h2 className="font-lexend font-bold text-2xl text-on-surface">Curated Menu</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {restaurant.menu.map(item => (
              <div key={item.id} className="glass-1 rounded-[32px] p-6 flex flex-col gap-5 hover:shadow-2xl transition-all group border border-outline-variant/30">
                <div className="relative overflow-hidden rounded-[24px] h-48 w-full">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20
                      ${item.isVeg ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-lexend font-black text-xl text-charcoal leading-tight truncate">{item.name}</h3>
                    <span className="font-lexend font-black text-xl text-primary">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-on-surface-variant text-xs line-clamp-2 font-medium leading-relaxed">{item.description}</p>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between">
                    {item.hasPortions ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">Portions Available</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">Single Portion</span>
                    )}
                    <button onClick={() => {
                      if (item.hasPortions) setPortionItem(item);
                      else addToCart(item);
                    }}
                      className="btn-primary px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      <span className="font-bold text-sm">Add +</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-12 glass-1 rounded-[40px] p-8 border border-outline-variant/30 shadow-2xl">
            <h3 className="font-lexend font-black text-2xl mb-8 flex items-center gap-3">
              🍱 Your Selection
            </h3>
            {cartCount === 0 ? (
              <div className="py-12 text-center opacity-40">
                <p className="text-5xl mb-4">🛒</p>
                <p className="font-bold uppercase tracking-widest text-[10px]">Your basket is empty</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <p className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest">Grand Total</p>
                  <p className="font-lexend font-black text-4xl text-primary">${cartTotal.toFixed(2)}</p>
                </div>
                <button onClick={() => navigate('/customer/cart')}
                  className="w-full btn-primary py-5 rounded-2xl text-lg shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {portionItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setPortionItem(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-[48px] p-10 shadow-2xl animate-in zoom-in duration-500">
            <h2 className="font-lexend font-black text-3xl text-charcoal mb-2 tracking-tight">Select Portion</h2>
            <p className="text-on-surface-variant font-medium mb-8 text-sm">Choose the perfect size for your appetite</p>
            
            <div className="grid grid-cols-1 gap-3">
              {portionItem.portions?.map(p => (
                <button key={p.label} onClick={() => { addToCart(portionItem, p); setPortionItem(null); }}
                  className="flex justify-between items-center p-5 rounded-[24px] bg-surface-container/50 border-2 border-transparent hover:border-primary hover:bg-primary/5 transition-all group">
                  <div>
                    <p className="font-lexend font-black text-lg text-charcoal leading-none mb-1">{p.label}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recommended size</p>
                  </div>
                  <span className="font-lexend font-black text-xl text-primary">${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            
            <button onClick={() => setPortionItem(null)} className="w-full mt-6 py-4 rounded-2xl text-on-surface-variant font-black text-xs uppercase tracking-widest hover:underline">Cancel</button>
          </div>
        </div>
      )}

        {/* Sidebar: Cart Summary for Desktop */}
        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-12 bg-white rounded-[32px] p-8 border border-outline-variant/30 shadow-2xl shadow-charcoal/5">
            <h3 className="font-lexend font-bold text-xl mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={2}/></svg>
              Your Order
            </h3>
            
            {cartCount === 0 ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-4 opacity-20">🛒</p>
                <p className="text-on-surface-variant font-medium">Your basket is empty.</p>
                <p className="text-xs text-on-surface-variant mt-1">Add items to start your gourmet experience.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                  {/* We would map actual cart items here if useApp provided them, 
                      for now let's assume it does since we defined it in context */}
                  <p className="text-sm font-bold text-on-surface">Items in basket:</p>
                  <p className="text-3xl font-lexend font-bold text-primary">${cartTotal.toFixed(2)}</p>
                </div>
                <div className="space-y-3 pt-6 border-t border-outline-variant/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-bold text-on-surface">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Delivery Fee</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                </div>
                <button onClick={() => navigate('/customer/cart')}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3">
                  Proceed to Checkout
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7l5 5-5 5M6 12h12" strokeWidth={2.5}/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50 md:hidden">
          <button onClick={() => navigate('/customer/cart')}
            className="w-full btn-primary flex justify-between items-center shadow-2xl shadow-primary/40">
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {cartCount} items
            </span>
            <span className="font-bold">View Basket</span>
            <span className="font-lexend font-bold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      <div className="md:hidden">
        <MobileNav active="home" />
      </div>
    </div>
  );
}
