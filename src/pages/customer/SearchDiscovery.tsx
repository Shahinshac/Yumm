import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const CUISINES = ['All','French','Japanese','Modern European','Italian','Chinese','Indian','Vegan','Desserts'];
const POPULAR = ['Truffle','Sushi','Healthy','Burger','Quick Delivery'];

export default function SearchDiscovery() {
  const navigate = useNavigate();
  const { restaurants } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const filtered = restaurants.filter(r => {
    const matchQ = query === '' || 
      r.name.toLowerCase().includes(query.toLowerCase()) || 
      (r.tags || '').toLowerCase().includes(query.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(query.toLowerCase());
    const matchC = selectedCuisine === 'All' || 
      r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()) || 
      (r.tags || '').toLowerCase().includes(selectedCuisine.toLowerCase());
    return matchQ && matchC;
  });

  return (
    <div className="bg-surface min-h-screen">
      {/* Search Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg pt-14 px-6 pb-6 border-b border-outline-variant/30">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-surface-container transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-lexend font-bold text-3xl">Discovery</h1>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant group-focus-within:text-primary transition-colors">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            type="text"
            placeholder="Search restaurants or cuisines..."
            className="w-full glass-1 rounded-2xl pl-14 pr-12 py-4.5 font-bold text-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border border-outline-variant/50"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      </header>

      <div className="px-6 pt-8 pb-32 max-w-2xl mx-auto">
        {!query && (
          <div className="mb-10">
            <h2 className="font-lexend font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4 px-1">Popular Right Now</h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map(p => (
                <button key={p} onClick={() => setQuery(p)}
                  className="px-5 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-sm font-bold hover:border-primary transition-colors">
                  #{p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Scroller */}
        <div className="mb-8 overflow-hidden">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {CUISINES.map(c => (
              <button key={c} onClick={() => setSelectedCuisine(c)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all duration-300 border
                  ${selectedCuisine === c ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white text-on-surface-variant border-outline-variant/50 hover:border-primary/50'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="font-lexend font-bold text-xl">
            {query || selectedCuisine !== 'All' ? 'Search Results' : 'Explore All'}
          </h3>
          <span className="badge-orange">{filtered.length} found</span>
        </div>

        {/* Results Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-surface-container/50 rounded-[40px] border-2 border-dashed border-outline-variant">
            <div className="text-6xl mb-6">🏜️</div>
            <p className="font-lexend font-bold text-2xl text-on-surface">Nothing found</p>
            <p className="text-on-surface-variant mt-2 max-w-xs mx-auto">We couldn't find matches for your search. Try adjusting your filters or query.</p>
            <button onClick={() => { setQuery(''); setSelectedCuisine('All'); }} className="mt-8 text-primary font-bold underline">Clear all filters</button>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(r => (
              <button key={r.id} onClick={() => navigate(`/customer/restaurant/${r.id}`)}
                className="w-full text-left group">
                <div className="glass-1 rounded-[32px] p-4 flex gap-5 border border-outline-variant/30 hover:shadow-2xl hover:shadow-charcoal/5 hover:-translate-y-1 transition-all duration-500">
                  <div className="relative w-28 h-28 rounded-[24px] overflow-hidden flex-shrink-0 border border-outline-variant/20 shadow-md">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-lexend font-bold text-xl text-on-surface truncate group-hover:text-primary transition-colors">{r.name}</h4>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                        <span className="text-yellow-600 text-xs">★</span>
                        <span className="text-yellow-800 font-bold text-[10px]">{r.rating}</span>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm line-clamp-1 mb-3">{r.cuisine} • {r.tags}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3" strokeWidth={2} strokeLinecap="round" /></svg>
                        <span className="text-xs font-bold text-on-surface">{r.deliveryTime}</span>
                      </div>
                      <span className="w-1 h-1 bg-outline-variant rounded-full" />
                      <span className="text-xs font-bold text-emerald-600">{r.deliveryFee}</span>
                    </div>
                    {r.promo && (
                      <div className="mt-3 inline-block">
                        <span className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">{r.promo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <MobileNav active="search" />
    </div>
  );
}
