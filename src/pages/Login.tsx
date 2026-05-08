import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../context/AppContext';

type Role = 'customer' | 'owner' | 'admin' | 'partner';
type Screen = 'role' | 'admin-login' | 'customer-auth' | 'owner-auth' | 'partner-auth'
            | 'owner-register' | 'partner-register' | 'pending-approval';

const roles: { id: Role; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'customer',  label: 'Explore & Order',      emoji: '🍔', desc: 'Browse best restaurants and order food', color: 'bg-primary' },
  { id: 'owner',     label: 'Restaurant Partner',   emoji: '🏪', desc: 'Register and manage your restaurant', color: 'bg-charcoal' },
  { id: 'partner',   label: 'Delivery Hero',        emoji: '🚲', desc: 'Join our fleet and start earning', color: 'bg-emerald-600' },
];

function Field({ label, type = 'text', value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="group">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-on-surface-variant group-focus-within:text-primary transition-colors">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required
        className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-[20px] px-5 py-4 font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
      />
    </div>
  );
}

function GoogleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-4 bg-white border border-outline-variant/50 rounded-[24px] py-4 shadow-xl shadow-charcoal/5 hover:shadow-2xl hover:border-primary/20 transition-all group">
      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span className="font-lexend font-black text-xs uppercase tracking-widest text-charcoal">Authenticate with Google</span>
    </button>
  );
}

function HeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-charcoal">
      <img 
        src="https://images.unsplash.com/photo-1550966841-3ee323867623?q=80&w=2000&auto=format&fit=crop" 
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 hover:scale-100 transition-transform duration-[10s]"
        alt="Gourmet"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-charcoal via-charcoal/40 to-transparent" />
      
      <div className="relative z-10 flex flex-col justify-end p-20 w-full">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-white font-lexend font-black text-3xl shadow-2xl shadow-primary/40">N</div>
          <div>
            <span className="font-lexend font-black text-white text-3xl tracking-tight leading-none block">NEXFOOD</span>
            <span className="text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] mt-1 block">Haute Cuisine Network</span>
          </div>
        </div>
        <h1 className="font-lexend font-black text-7xl text-white leading-[0.9] tracking-tighter mb-8">
          Culinary Luxury,<br/>
          <span className="text-primary italic">Delivered.</span><br/>
        </h1>
        <p className="text-white/60 text-xl font-medium leading-relaxed max-w-lg mb-12">
          The world's most sophisticated food logistics ecosystem. Connecting legendary chefs with the most discerning palates.
        </p>
        <div className="flex gap-10">
          {[
            { label: 'Network Active', val: '4.9/5' },
            { label: 'Partners', val: '12k+' },
            { label: 'Cuisines', val: '50+' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-white font-lexend font-black text-2xl">{s.val}</p>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, registerOwner, registerPartner } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [screen, setScreen] = useState<Screen>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPass, setCustPass] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [restName, setRestName] = useState('');
  const [restLocation, setRestLocation] = useState('');
  const [restCategory, setRestCategory] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');

  const goTo = (s: Screen) => { setError(''); setScreen(s); };

  const handleRoleContinue = () => {
    if (selectedRole === 'admin') goTo('admin-login');
    else if (selectedRole === 'customer') goTo('customer-auth');
    else if (selectedRole === 'owner') goTo('owner-auth');
    else goTo('partner-auth');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = adminUser.trim().toLowerCase();
    const pass = adminPass.trim();
    if (user === 'shahinsha' && pass === '262007') {
      setLoading(true);
      if (login('admin', 'Shahinsha')) {
        setTimeout(() => navigate('/admin'), 700);
      } else {
        setLoading(false);
      }
    } else setError('Security Clearance Denied.');
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (login('customer', custEmail.split('@')[0], custEmail)) {
      setTimeout(() => navigate('/customer'), 700);
    } else {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        setLoading(true);
        const user = await GoogleAuth.signIn();
        if (login(selectedRole, user.name, user.email)) {
          setTimeout(() => navigate(selectedRole === 'customer' ? '/customer' : `/${selectedRole}`), 700);
        } else setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error('Native Google Login Error:', err);
      }
    } else {
      // Web login handled by @react-oauth/google hook
      webGoogleLogin();
    }
  };

  const webGoogleLogin = useGoogleLogin({
    onSuccess: () => {
      setLoading(true);
      if (login(selectedRole, 'Sophia Laurent')) {
        setTimeout(() => navigate(selectedRole === 'customer' ? '/customer' : `/${selectedRole}`), 700);
      } else {
        setLoading(false);
      }
    }
  });

  const renderContent = () => {
    if (screen === 'role') return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="font-lexend font-black text-3xl text-charcoal mb-1 tracking-tight">Welcome to NexFood</h2>
        <p className="text-on-surface-variant font-medium mb-6 text-sm">Select how you want to use the platform</p>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSelectedRole(role.id)}
              className={`flex items-center gap-4 p-4 rounded-[24px] border-2 transition-all duration-300 group
                ${selectedRole === role.id ? 'border-primary bg-primary/5 shadow-lg scale-[1.01]' : 'border-outline-variant/20 bg-surface hover:border-primary/20'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md border border-white/50 transition-transform group-hover:rotate-3
                ${selectedRole === role.id ? 'bg-primary text-white shadow-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>
                {role.emoji}
              </div>
              <div className="text-left flex-1">
                <p className="font-lexend font-black text-base text-charcoal leading-none mb-1">{role.label}</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{role.desc}</p>
              </div>
              {selectedRole === role.id && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <button onClick={handleRoleContinue} className="w-full btn-primary rounded-[20px] py-4 text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all">
          Continue
        </button>
        <div className="mt-8 pt-4 border-t border-outline-variant/10 text-center">
          <button 
            onClick={() => { setSelectedRole('admin'); goTo('admin-login'); }}
            className="text-on-surface-variant/40 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Admin portal
          </button>
        </div>
      </div>
    );

    if (screen === 'admin-login') return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <BackBtn onClick={() => goTo('role')} />
        <h2 className="font-lexend font-black text-3xl text-charcoal mb-6 tracking-tight">Operations Portal</h2>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <Field label="Username" value={adminUser} onChange={setAdminUser} placeholder="Enter your ID" />
          <Field label="Password" type="password" value={adminPass} onChange={setAdminPass} placeholder="••••••••" />
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary rounded-[20px] py-4 text-lg mt-2">
            {loading ? <Spinner /> : 'Sign In'}
          </button>
        </form>
      </div>
    );

    if (screen === 'customer-auth') return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <BackBtn onClick={() => goTo('role')} />
        <h2 className="font-lexend font-black text-3xl text-charcoal mb-6 tracking-tight">Welcome back</h2>
        <div className="space-y-6">
          <GoogleBtn onClick={() => handleGoogleLogin()} />
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">or sign in with email</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <Field label="Email" type="email" value={custEmail} onChange={setCustEmail} placeholder="your@email.com" />
            <Field label="Password" type="password" value={custPass} onChange={setCustPass} placeholder="••••••••" />
            <button type="submit" disabled={loading} className="w-full btn-primary rounded-[20px] py-4 text-lg">
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );

    if (screen === 'owner-auth' || screen === 'partner-auth') return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <BackBtn onClick={() => goTo('role')} />
        <h2 className="font-lexend font-black text-3xl text-charcoal mb-1 tracking-tight">
          {selectedRole === 'owner' ? 'Merchant Portal' : 'Logistics Portal'}
        </h2>
        <p className="text-on-surface-variant font-medium mb-8 text-sm">Access your enterprise dashboard</p>
        
        <div className="space-y-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            if (login(selectedRole, partnerEmail.split('@')[0], partnerEmail)) {
              setTimeout(() => navigate(`/${selectedRole}`), 700);
            } else {
              setLoading(false);
              setError('Security Access Denied: Account not approved or not found.');
            }
          }} className="space-y-4">
            <Field label="Registration Email" type="email" value={partnerEmail} onChange={setPartnerEmail} placeholder="your@email.com" />
            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-primary rounded-[20px] py-4 text-lg shadow-xl shadow-primary/20">
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">New to NexFood?</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          <button onClick={() => goTo(selectedRole === 'owner' ? 'owner-register' : 'partner-register')}
            className="w-full bg-charcoal text-white rounded-[20px] py-4 font-lexend font-black text-base shadow-lg hover:scale-[1.01] active:scale-95 transition-all">
            Start New Application
          </button>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Approval time for new partners: ~24 Hours
        </p>
      </div>
    );

    if (screen === 'owner-register') return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <BackBtn onClick={() => goTo('owner-auth')} />
        <h2 className="font-lexend font-black text-2xl text-charcoal mb-6 tracking-tight">Business Registration</h2>
        <form onSubmit={(e) => { e.preventDefault(); registerOwner({ name: ownerName, email: ownerEmail, phone: ownerPhone, restaurantName: restName, cuisineType: restCategory }); goTo('pending-approval'); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={ownerName} onChange={setOwnerName} placeholder="Your name" />
          <Field label="Email" type="email" value={ownerEmail} onChange={setOwnerEmail} placeholder="Business email" />
          <Field label="Phone" value={ownerPhone} onChange={setOwnerPhone} placeholder="Business phone" />
          <div className="md:col-span-1"><Field label="Restaurant Name" value={restName} onChange={setRestName} placeholder="Name of your outlet" /></div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-on-surface-variant">Cuisine Type</label>
            <select value={restCategory} onChange={e => setRestCategory(e.target.value)} required
              className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-[16px] px-5 py-3.5 font-bold text-on-surface focus:outline-none focus:border-primary appearance-none text-sm">
              <option value="">Choose category</option>
              {['Indian','Italian','Chinese','Japanese','French','Mediterranean','Continental','Bakery'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="md:col-span-2 w-full btn-primary rounded-[20px] py-4 text-lg mt-2">Submit Application</button>
        </form>
      </div>
    );

    if (screen === 'partner-register') return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <BackBtn onClick={() => goTo('partner-auth')} />
        <h2 className="font-lexend font-black text-2xl text-charcoal mb-6 tracking-tight">Logistics Application</h2>
        <form onSubmit={(e) => { e.preventDefault(); registerPartner({ name: partnerName, email: partnerEmail, phone: partnerPhone, vehicleType: vehicleType }); goTo('pending-approval'); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={partnerName} onChange={setPartnerName} placeholder="Your legal name" />
          <Field label="Email" type="email" value={partnerEmail} onChange={setPartnerEmail} placeholder="Personal email" />
          <Field label="Phone" value={partnerPhone} onChange={setPartnerPhone} placeholder="+1 (555) 000-0000" />
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 text-on-surface-variant">Vehicle Type</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} required
              className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-[16px] px-5 py-3.5 font-bold text-on-surface focus:outline-none focus:border-primary appearance-none text-sm">
              <option value="Bicycle">Bicycle</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Scooter">Scooter</option>
              <option value="Car">Car</option>
            </select>
          </div>
          <button type="submit" className="md:col-span-2 w-full btn-primary rounded-[20px] py-4 text-lg mt-2">Join the Fleet</button>
        </form>
      </div>
    );

    if (screen === 'pending-approval') return (
      <div className="text-center py-10 animate-in zoom-in duration-500">
        <div className="relative w-32 h-32 bg-primary/10 rounded-[48px] flex items-center justify-center text-6xl mx-auto mb-10">
          <div className="absolute inset-0 bg-primary/10 rounded-[48px] animate-ping" />
          ⏳
        </div>
        <h2 className="font-lexend font-black text-4xl text-charcoal mb-4 tracking-tight">Protocol Initiated</h2>
        <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm mx-auto mb-10 text-lg">
          Your credentials have been securely transmitted to our Global Warden team for verification.
        </p>
        <div className="bg-surface-container p-8 rounded-[32px] text-left space-y-4 mb-12">
          {['Verification in progress','Global background check','Access key generation'].map((t, i) => (
            <div key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-charcoal">
              <span className="w-2 h-2 bg-primary rounded-full" /> {t}
            </div>
          ))}
        </div>
        <button onClick={() => goTo('role')} className="text-primary font-black uppercase tracking-[0.3em] text-xs hover:underline transition-all">← Abort & Return to Hub</button>
      </div>
    );

    return null;
  };

  return (
    <div className="h-screen w-screen flex bg-surface overflow-hidden">
      <HeroPanel />
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-lexend font-black text-xl">N</div>
            <span className="font-lexend font-black text-charcoal text-xl tracking-tighter">NEXFOOD</span>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] mb-6 text-on-surface-variant hover:text-primary transition-all group">
      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
      Return
    </button>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-4">
      <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
      <span className="font-lexend font-black uppercase tracking-widest text-xs">Authenticating...</span>
    </span>
  );
}
