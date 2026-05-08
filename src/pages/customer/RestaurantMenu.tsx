import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurants, addToCart, cartCount, cartTotal } = useApp();
  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) return (
    <div className="mobile-frame flex items-center justify-center min-h-screen">
      <p className="font-lexend font-bold text-xl">Restaurant not found.</p>
    </div>
  );

  return (
    <div className="app-container bg-surface min-h-screen">
      {/* Hero */}
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
            <button className="glass-1 px-4 py-2 rounded-2xl hidden md:flex items-center gap-2 text-white font-bold">
              <span>Share</span>
            </button>
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
                  <span className="text-white/70 text-sm">({restaurant.reviewCount}+ reviews)</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex glass-1 px-6 py-3 rounded-2xl items-center gap-6 text-white border border-white/20">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Delivery</p>
                <p className="font-bold">{restaurant.deliveryTime}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Fee</p>
                <p className="font-bold text-emerald-400">{restaurant.deliveryFee}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-12 px-6 md:px-12 py-8 md:py-12">
        {/* Menu Section */}
        <div className="md:col-span-8">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/30">
            <h2 className="font-lexend font-bold text-2xl text-on-surface">Main Menu</h2>
            <div className="flex gap-2">
              <button className="chip-active text-xs">Full Menu</button>
              <button className="chip-inactive text-xs">Popular</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {restaurant.menu.map(item => (
              <div key={item.id} className="glass-1 rounded-[24px] p-5 flex gap-4 hover:shadow-xl hover:shadow-charcoal/5 transition-all group">
                <div className="relative overflow-hidden rounded-2xl w-24 h-24 flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-lexend font-bold text-on-surface truncate group-hover:text-primary transition-colors">{item.name}</p>
                    {item.isVeg && (
                      <span className="w-4 h-4 border-2 border-green-600 rounded-sm flex items-center justify-center flex-shrink-0">
                        <span className="w-2 h-2 bg-green-600 rounded-full" />
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-xs mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="font-lexend font-bold text-xl text-primary">${item.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(item)}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-charcoal transition-all shadow-lg shadow-primary/10">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[358px] px-6 z-50 md:hidden">
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
