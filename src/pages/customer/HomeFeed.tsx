import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const categories = ['All','Burgers','Sushi','French','Vegan','Desserts','Pizza'];

export default function HomeFeed() {
  const { restaurants, userLocation, updateLocation } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="app-container bg-surface min-h-screen">
      {/* Hero background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-24 translate-x-24 pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-12 pt-14 pb-4 flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Delivering to</p>
          <button onClick={updateLocation} className="flex items-center mt-1 gap-1 group">
            <span className="font-lexend font-bold text-xl md:text-2xl text-on-surface group-hover:text-primary transition-colors">{userLocation}</span>
            <svg className="w-5 h-5 text-primary mt-0.5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex gap-4 items-center">
          <button className="hidden md:flex btn-secondary rounded-2xl py-2 px-6 text-sm">Become a Partner</button>
          <button className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area - Grid for Desktop */}
      <div className="md:grid md:grid-cols-12 md:gap-12 px-6 md:px-12">
        <div className="md:col-span-8">
          {/* Search */}
          <div className="mb-6 relative z-10">
            <button onClick={() => navigate('/customer/search')}
              className="w-full glass-1 rounded-2xl px-4 py-4 flex items-center gap-3 text-left shadow-lg shadow-charcoal/5">
              <svg className="w-6 h-6 text-on-surface-variant flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-on-surface-variant text-lg">Search for restaurants, cuisines, or dishes...</span>
            </button>
          </div>

          {/* Promo Banner */}
          <div className="mb-8 relative z-10">
            <div className="rounded-[32px] overflow-hidden relative h-48 md:h-56"
              style={{ background: 'linear-gradient(135deg, #281812 0%, #5c4037 100%)' }}>
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="relative z-10 p-8 flex flex-col justify-between h-full">
                <span className="badge-orange self-start text-sm">🔥 Exclusive Offer</span>
                <div>
                  <h2 className="font-lexend font-bold text-3xl md:text-5xl text-white leading-tight">50% OFF<br/>First Order</h2>
                  <p className="text-white/60 text-sm md:text-base mt-2">Use code: <span className="text-primary font-bold">NEXFOOD50</span> at checkout</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cuisine Categories */}
          <section className="mb-10 relative z-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-lexend font-bold text-2xl text-on-surface">Explore Cuisines</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 transition-all duration-300 text-base py-3 px-8 rounded-full border ${activeCategory === cat ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Featured Restaurants */}
          <section className="mb-12 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-lexend font-bold text-2xl text-on-surface">Featured Restaurants</h2>
                <p className="text-on-surface-variant text-base">Hand-picked premium selections for you</p>
              </div>
              <button className="text-primary font-bold text-base hover:underline">See all restaurants</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {restaurants.map(r => (
                <button key={r.id} onClick={() => navigate(`/customer/restaurant/${r.id}`)}
                  className="w-full text-left group">
                  <div className="rounded-[32px] overflow-hidden relative h-64 shadow-xl shadow-charcoal/5 border border-outline-variant/30">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-80" />
                    {r.promo && (
                      <div className="absolute top-5 left-5">
                        <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full font-lexend shadow-lg shadow-primary/30">{r.promo}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="glass-3 rounded-2xl p-4 border border-white/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-lexend font-bold text-on-surface text-lg leading-tight">{r.name}</p>
                            <p className="text-on-surface-variant text-sm mt-1">{r.cuisine}</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                            <span className="text-primary text-sm">★</span>
                            <span className="font-bold text-sm text-on-surface">{r.rating}</span>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3 pt-3 border-t border-outline-variant/20">
                          <span className="text-sm text-on-surface-variant flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth={2} strokeLinecap="round" /></svg>
                            {r.deliveryTime}
                          </span>
                          <span className="text-sm text-emerald-600 font-bold">{r.deliveryFee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar for Desktop: Recommendations & Cart */}
        <div className="hidden md:block md:col-span-4 space-y-8 sticky top-14 self-start">
          <section className="glass-1 rounded-[32px] p-8 border border-white/40 shadow-2xl shadow-charcoal/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-lexend font-bold text-xl text-on-surface">Top Picks</h2>
              <button className="text-primary font-bold text-sm">Refresh</button>
            </div>
            <div className="space-y-6">
              {restaurants.flatMap(r => (r.menu || []).slice(0,1)).slice(0,3).map(item => (
                <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative overflow-hidden rounded-2xl w-20 h-20 flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-on-surface-variant text-xs mt-1 line-clamp-1">{item.description}</p>
                    <p className="font-lexend font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-charcoal transition-colors shadow-lg shadow-primary/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2.5} strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg>
             </div>
             <h3 className="font-lexend font-bold text-xl mb-2">Need Help?</h3>
             <p className="text-white/80 text-sm leading-relaxed mb-6">Our gourmet concierges are available 24/7 to assist with your order.</p>
             <button className="w-full py-3 bg-white text-primary rounded-2xl font-bold hover:bg-surface transition-colors">Chat with Support</button>
          </section>
        </div>
      </div>

      <div className="md:hidden">
        <MobileNav active="home" />
      </div>
    </div>
  );
}
