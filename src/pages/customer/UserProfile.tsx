import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

const profileMenu = [
  { icon: '📍', label: 'Saved Addresses', color: 'bg-blue-50 text-blue-600' },
  { icon: '❤️', label: 'Favourites', color: 'bg-red-50 text-red-500' },
  { icon: '💳', label: 'Payment Methods', color: 'bg-green-50 text-green-600' },
  { icon: '🔔', label: 'Notifications', color: 'bg-purple-50 text-purple-600' },
  { icon: '❓', label: 'Help & Support', color: 'bg-orange-50 text-orange-500' },
];

export default function UserProfile() {
  const navigate = useNavigate();
  const { orders, currentUser } = useApp();

  return (
    <div className="mobile-frame bg-surface min-h-screen">
      {/* Hero */}
      <div className="relative h-52">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #281812 0%, #5c4037 100%)' }} />
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800')] bg-cover" />
        <header className="relative z-10 pt-12 px-6 flex justify-between items-center">
          <h1 className="font-lexend font-bold text-2xl text-white">Profile</h1>
          <button className="glass-1 px-3 py-1.5 rounded-full text-white text-sm font-bold">Edit</button>
        </header>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center -mt-14 relative z-10 mb-4">
        <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center text-3xl font-black text-primary">
          {currentUser?.name?.charAt(0) || 'U'}
        </div>
        <h2 className="font-lexend font-bold text-2xl mt-3 text-on-surface">{currentUser?.name || 'Guest'}</h2>
        <p className="text-on-surface-variant font-medium lowercase">{currentUser?.email || `${currentUser?.name || 'user'}@nexfood.com`}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-6 mb-6">
        {[
          { label: 'Orders', value: orders.length },
          { label: 'Favourites', value: 12 },
          { label: 'Reviews', value: 8 },
        ].map(s => (
          <div key={s.label} className="glass-1 rounded-2xl p-4 text-center">
            <p className="font-lexend font-bold text-2xl text-on-surface">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-6 space-y-3 pb-32">
        {profileMenu.map(item => (
          <button key={item.label}
            className="w-full glass-1 rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.color}`}>
              {item.icon}
            </div>
            <span className="flex-1 font-semibold text-on-surface">{item.label}</span>
            <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        <button onClick={() => navigate('/')}
          className="w-full glass-1 rounded-2xl p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-lg">🚪</div>
          <span className="flex-1 font-bold">Log Out</span>
        </button>
      </div>

      <MobileNav active="profile" />
    </div>
  );
}
