import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

type NavProps = { active: 'home'|'search'|'orders'|'profile' };

export default function MobileNav({ active }: NavProps) {
  const navigate = useNavigate();
  const { cartCount } = useApp();

  const items = [
    { id: 'home', path: '/customer', label: 'Home', icon: (
      <svg className="w-6 h-6" fill={active==='home'?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active==='home'?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { id: 'search', path: '/customer/search', label: 'Search', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active==='search'?2.5:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )},
    { id: 'orders', path: '/customer/orders', label: 'Orders', icon: (
      <svg className="w-6 h-6" fill={active==='orders'?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active==='orders'?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { id: 'profile', path: '/customer/profile', label: 'Profile', icon: (
      <svg className="w-6 h-6" fill={active==='profile'?'currentColor':'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active==='profile'?0:1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] z-50">
      <div className="glass-3 rounded-t-[32px] px-6 pt-4 pb-8">
        <div className="flex justify-between items-center">
          {items.map(item => (
            <button key={item.id} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${active === item.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {item.icon}
              <span className={`text-xs font-medium ${active === item.id ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
