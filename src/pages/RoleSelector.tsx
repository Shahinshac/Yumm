import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const roles = [
  { id: 'customer', path: '/customer', label: 'Customer', desc: 'Discover & order premium food', emoji: '🛍️',
    bg: 'from-[#ff5200]/20 to-[#d24200]/10', border: 'border-[#d24200]/20' },
  { id: 'owner', path: '/owner', label: 'Restaurant Owner', desc: 'Manage orders & earnings', emoji: '👨‍🍳',
    bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
  { id: 'partner', path: '/partner', label: 'Delivery Partner', desc: 'Accept orders & navigate', emoji: '🛵',
    bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20' },
  { id: 'admin', path: '/admin', label: 'Platform Admin', desc: 'System-wide oversight', emoji: '⚙️',
    bg: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20' },
];

export default function RoleSelector() {
  const navigate = useNavigate();
  const { logout } = useApp();

  React.useEffect(() => {
    logout();
  }, []);
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6"
      style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(210,66,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(210,66,0,0.05) 0%, transparent 50%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] mb-6 relative group"
            style={{ background: 'linear-gradient(135deg, #a83300, #d24200)', boxShadow: '0 12px 48px rgba(168,51,0,0.35)' }}>
            <div className="absolute inset-0 bg-white/10 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl text-white font-lexend font-black">N</span>
          </div>
          <h1 className="text-4xl font-lexend font-black text-on-surface tracking-tighter">NexFood</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mt-2">Executive Access Hub</p>
        </div>

        <div className="space-y-3">
          {roles.map(role => (
            <button key={role.id} onClick={() => navigate(role.path)}
              className={`w-full glass-1 rounded-[20px] p-5 flex items-center text-left hover:-translate-y-0.5 hover:glass-2 transition-all duration-200 border ${role.border} bg-gradient-to-r ${role.bg} group`}>
              <span className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">{role.emoji}</span>
              <div>
                <p className="font-lexend font-bold text-on-surface text-lg leading-tight">{role.label}</p>
                <p className="text-on-surface-variant text-sm mt-0.5">{role.desc}</p>
              </div>
              <svg className="ml-auto text-on-surface-variant w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <p className="text-center text-on-surface-variant text-xs mt-8">
          Haute Cuisine Delivery System · v1.0
        </p>
      </div>
    </div>
  );
}
