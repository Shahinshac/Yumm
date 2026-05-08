import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const cuisines = ['All','French','Japanese','Modern European','Seafood','Vegan','Desserts'];

export default function SearchDiscovery() {
  const navigate = useNavigate();
  const { restaurants } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const filtered = restaurants.filter(r => {
    const matchQ = query === '' || r.name.toLowerCase().includes(query.toLowerCase()) || r.tags.toLowerCase().includes(query.toLowerCase());
    const matchC = selectedCuisine === 'All' || r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()) || r.tags.toLowerCase().includes(selectedCuisine.toLowerCase());
    return matchQ && matchC;
  });

  return (
    <div className="mobile-frame bg-surface min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-3 px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="glass-1 w-10 h-10 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-lexend font-bold text-2xl">Search</h1>
        </div>

        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)} type="text"
            placeholder="Restaurants, cuisines, dishes..."
            className="w-full glass-1 rounded-2xl pl-12 pr-10 py-3.5 font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="px-6 pt-5 pb-32">
        {/* Cuisine chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {cuisines.map(c => (
            <button key={c} onClick={() => setSelectedCuisine(c)}
              className={`flex-shrink-0 transition-all duration-200 ${selectedCuisine === c ? 'chip-active' : 'chip-inactive'}`}>
              {c}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-lexend font-bold text-xl">No results found</p>
            <p className="text-on-surface-variant mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(r => (
              <button key={r.id} onClick={() => navigate(`/customer/restaurant/${r.id}`)}
                className="w-full text-left glass-1 rounded-2xl p-4 flex gap-4 hover:scale-[1.01] transition-transform">
                <img src={r.imageUrl} alt={r.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-lexend font-bold text-on-surface truncate">{r.name}</p>
                    {r.promo && <span className="badge-orange flex-shrink-0">{r.promo}</span>}
                  </div>
                  <p className="text-on-surface-variant text-xs mt-0.5 truncate">{r.tags}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">★ {r.rating}</span>
                    <span className="text-xs text-on-surface-variant">{r.deliveryTime}</span>
                    <span className="text-xs text-emerald-600 font-medium">{r.deliveryFee}</span>
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
