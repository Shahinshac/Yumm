import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useApp } from '../context/AppContext';

type Role = 'customer' | 'owner' | 'admin' | 'partner';
type Screen = 'role' | 'admin-login' | 'customer-auth' | 'owner-auth' | 'partner-auth'
            | 'owner-register' | 'partner-register' | 'pending-approval';

const roles: { id: Role; label: string; emoji: string; desc: string }[] = [
  { id: 'customer',  label: 'Customer',           emoji: '🍽️', desc: 'Order from top restaurants' },
  { id: 'owner',     label: 'Restaurant Owner',   emoji: '🧑‍🍳', desc: 'Manage your restaurant' },
  { id: 'partner',   label: 'Delivery Partner',   emoji: '🛵', desc: 'Deliver and earn' },
  { id: 'admin',     label: 'Platform Admin',     emoji: '🛡️', desc: 'Oversee the platform' },
];

// ─── Reusable input ──────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-1.5" style={{ color: '#281812' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required
        className="w-full glass-1 rounded-xl px-4 py-3.5 font-medium focus:outline-none transition"
        style={{ color: '#281812' }}
      />
    </div>
  );
}

// ─── Google button ───────────────────────────────────────────────────────────
function GoogleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center justify-center gap-3 border-2 border-outline-variant bg-white rounded-2xl py-3.5 font-bold hover:bg-gray-50 transition-all">
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span style={{ color: '#281812' }}>Continue with Google</span>
    </button>
  );
}

// ─── Hero left panel ─────────────────────────────────────────────────────────
function HeroPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #281812 0%, #5c4037 60%, #a83300 100%)' }}>
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{ background: 'rgba(210,66,0,0.2)' }} />
      <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full blur-[60px]"
        style={{ background: 'rgba(210,66,0,0.1)' }} />
      <div className="relative z-10 flex flex-col justify-center p-12 w-full">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-lexend font-black text-lg">N</div>
          <span className="font-lexend font-bold text-white text-2xl">NexFood</span>
        </div>
        <h1 className="font-lexend font-bold text-5xl text-white leading-tight mb-4">
          Haute cuisine,<br/>delivered to<br/>your door.
        </h1>
        <p className="text-white/60 text-lg leading-relaxed max-w-sm">
          A multi-role platform connecting customers, restaurants, delivery partners, and administrators.
        </p>
      </div>
    </div>
  );
}

// ─── Main Login component ────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { login, registerOwner, registerPartner, pendingOwners, pendingPartners } = useApp();
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [screen, setScreen] = useState<Screen>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin creds
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Customer auth
  const [custEmail, setCustEmail] = useState('');
  const [custPass, setCustPass] = useState('');

  // Owner register
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [restName, setRestName] = useState('');
  const [restLocation, setRestLocation] = useState('');
  const [restCategory, setRestCategory] = useState('');

  // Partner register
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');

  // ── Submission handlers ──
  const goTo = (s: Screen) => { setError(''); setScreen(s); };

  const handleRoleContinue = () => {
    if (selectedRole === 'admin') goTo('admin-login');
    else if (selectedRole === 'customer') goTo('customer-auth');
    else if (selectedRole === 'owner') goTo('owner-auth');
    else goTo('partner-auth');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminUser === 'shahinsha' && adminPass === '262007') {
      setLoading(true);
      login('admin', 'Shahinsha');
      setTimeout(() => navigate('/admin'), 700);
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    login('customer', custEmail.split('@')[0]);
    setTimeout(() => navigate('/customer'), 700);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log('Google login success:', codeResponse);
      setLoading(true);
      // In a real app, you'd verify the token on the server
      login(selectedRole, selectedRole === 'customer' ? 'Sophia Laurent' : 'Partner');
      setTimeout(() => navigate(selectedRole === 'customer' ? '/customer' : `/${selectedRole}`), 700);
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  const handleOwnerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerOwner({ name: ownerName, email: ownerEmail, phone: ownerPhone, restaurantName: restName, restaurantLocation: restLocation, restaurantCategory: restCategory });
    goTo('pending-approval');
  };

  const handlePartnerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerPartner({ name: partnerName, email: partnerEmail, phone: partnerPhone, vehicleType });
    goTo('pending-approval');
  };

  // Check if current user already has an approved registration
  const findApproval = () => {
    const o = pendingOwners.find(o => o.email === ownerEmail || o.email === partnerEmail);
    const p = pendingPartners.find(p => p.email === partnerEmail);
    return (o?.status === 'approved') || (p?.status === 'approved');
  };

  // ── Right-panel content renderer ──
  const renderRight = () => {
    // ── Role selector ──
    if (screen === 'role') return (
      <>
        <h2 className="font-lexend font-bold text-3xl mb-2" style={{ color: '#281812' }}>Sign in as</h2>
        <p className="mb-8" style={{ color: '#5c4037' }}>Select your role to continue</p>
        <div className="space-y-3 mb-8">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSelectedRole(role.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200
                ${selectedRole === role.id ? 'border-primary bg-primary/5 shadow-md' : 'border-outline-variant bg-white hover:border-primary/30'}`}>
              <span className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center border border-outline-variant bg-surface">
                {role.emoji}
              </span>
              <div className="text-left">
                <p className="font-lexend font-bold" style={{ color: '#281812' }}>{role.label}</p>
                <p className="text-sm" style={{ color: '#5c4037' }}>{role.desc}</p>
              </div>
              {selectedRole === role.id && (
                <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <button onClick={handleRoleContinue} className="w-full btn-primary rounded-2xl py-4 text-lg">
          Continue →
        </button>
      </>
    );

    // ── Admin login ──
    if (screen === 'admin-login') return (
      <>
        <BackBtn onClick={() => goTo('role')} />
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="font-lexend font-bold text-3xl" style={{ color: '#281812' }}>Admin Login</h2>
            <p style={{ color: '#5c4037' }}>Platform Administration</p>
          </div>
        </div>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <Field label="Username" value={adminUser} onChange={setAdminUser} placeholder="shahinsha" />
          <Field label="Password" type="password" value={adminPass} onChange={setAdminPass} placeholder="••••••••" />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary rounded-2xl py-4 text-lg mt-2">
            {loading ? <Spinner /> : 'Sign In as Admin'}
          </button>
        </form>
      </>
    );

    // ── Customer auth ──
    if (screen === 'customer-auth') return (
      <>
        <BackBtn onClick={() => goTo('role')} />
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🍽️</span>
          <div>
            <h2 className="font-lexend font-bold text-3xl" style={{ color: '#281812' }}>Welcome back</h2>
            <p style={{ color: '#5c4037' }}>Sign in to your account</p>
          </div>
        </div>
        <div className="space-y-4">
          <GoogleBtn onClick={handleGoogleSignIn} />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-sm font-bold" style={{ color: '#5c4037' }}>or</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>
          <form onSubmit={handleCustomerLogin} className="space-y-4">
            <Field label="Email" type="email" value={custEmail} onChange={setCustEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={custPass} onChange={setCustPass} placeholder="••••••••" />
            <button type="submit" disabled={loading} className="w-full btn-primary rounded-2xl py-4 text-lg">
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>
        </div>
      </>
    );

    // ── Owner auth (sign in or register) ──
    if (screen === 'owner-auth') return (
      <>
        <BackBtn onClick={() => goTo('role')} />
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🧑‍🍳</span>
          <div>
            <h2 className="font-lexend font-bold text-3xl" style={{ color: '#281812' }}>Restaurant Owner</h2>
            <p style={{ color: '#5c4037' }}>Sign in or register your restaurant</p>
          </div>
        </div>
        <div className="space-y-4">
          <button onClick={() => goTo('owner-register')}
            className="w-full btn-secondary rounded-2xl py-4 font-bold text-base">
            📋 Register New Restaurant
          </button>
          <p className="text-xs text-center" style={{ color: '#5c4037' }}>
            New registrations require admin approval before you can log in.
          </p>
        </div>
      </>
    );

    // ── Partner auth ──
    if (screen === 'partner-auth') return (
      <>
        <BackBtn onClick={() => goTo('role')} />
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🛵</span>
          <div>
            <h2 className="font-lexend font-bold text-3xl" style={{ color: '#281812' }}>Delivery Partner</h2>
            <p style={{ color: '#5c4037' }}>Sign in or apply to deliver</p>
          </div>
        </div>
        <div className="space-y-4">
          <button onClick={() => goTo('partner-register')}
            className="w-full btn-secondary rounded-2xl py-4 font-bold text-base">
            📋 Register as Delivery Partner
          </button>
          <p className="text-xs text-center" style={{ color: '#5c4037' }}>
            Applications are reviewed and approved by our admin team.
          </p>
        </div>
      </>
    );

    // ── Owner registration form ──
    if (screen === 'owner-register') return (
      <>
        <BackBtn onClick={() => goTo('owner-auth')} />
        <h2 className="font-lexend font-bold text-2xl mb-1" style={{ color: '#281812' }}>Register Restaurant</h2>
        <p className="text-sm mb-6" style={{ color: '#5c4037' }}>Fill in your details — we'll review within 24 hours.</p>
        <form onSubmit={handleOwnerRegister} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#5c4037' }}>Your Details</p>
          <Field label="Full Name" value={ownerName} onChange={setOwnerName} placeholder="John Smith" />
          <Field label="Email" type="email" value={ownerEmail} onChange={setOwnerEmail} placeholder="john@restaurant.com" />
          <Field label="Phone Number" type="tel" value={ownerPhone} onChange={setOwnerPhone} placeholder="+91 98765 43210" />
          <p className="text-xs font-bold uppercase tracking-wider pt-2" style={{ color: '#5c4037' }}>Restaurant Details</p>
          <Field label="Restaurant Name" value={restName} onChange={setRestName} placeholder="The Golden Spoon" />
          <Field label="Location / Address" value={restLocation} onChange={setRestLocation} placeholder="123 Main St, City" />
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#281812' }}>Cuisine Category</label>
            <select value={restCategory} onChange={e => setRestCategory(e.target.value)} required
              className="w-full glass-1 rounded-xl px-4 py-3.5 font-medium focus:outline-none transition" style={{ color: '#281812' }}>
              <option value="">Select category</option>
              {['Indian','Italian','Chinese','Japanese','French','Mexican','Mediterranean','American','Vegan','Bakery & Desserts'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full btn-primary rounded-2xl py-4 text-base mt-2">
            Submit for Approval →
          </button>
        </form>
      </>
    );

    // ── Partner registration form ──
    if (screen === 'partner-register') return (
      <>
        <BackBtn onClick={() => goTo('partner-auth')} />
        <h2 className="font-lexend font-bold text-2xl mb-1" style={{ color: '#281812' }}>Apply as Delivery Partner</h2>
        <p className="text-sm mb-6" style={{ color: '#5c4037' }}>Your application will be reviewed by our admin team.</p>
        <form onSubmit={handlePartnerRegister} className="space-y-3">
          <Field label="Full Name" value={partnerName} onChange={setPartnerName} placeholder="Alex Kumar" />
          <Field label="Email Address" type="email" value={partnerEmail} onChange={setPartnerEmail} placeholder="alex@email.com" />
          <Field label="Phone Number" type="tel" value={partnerPhone} onChange={setPartnerPhone} placeholder="+91 98765 43210" />
          <div>
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#281812' }}>Vehicle Type</label>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
              className="w-full glass-1 rounded-xl px-4 py-3.5 font-medium focus:outline-none transition" style={{ color: '#281812' }}>
              {['Motorcycle','Scooter','Bicycle','Car'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full btn-primary rounded-2xl py-4 text-base mt-2">
            Submit Application →
          </button>
        </form>
      </>
    );

    // ── Pending approval screen ──
    if (screen === 'pending-approval') return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">⏳</div>
        <h2 className="font-lexend font-bold text-2xl mb-3" style={{ color: '#281812' }}>Application Submitted!</h2>
        <p className="leading-relaxed mb-6" style={{ color: '#5c4037' }}>
          Your registration has been sent to our admin team for review. You'll receive an email once approved — usually within 24 hours.
        </p>
        <div className="glass-1 rounded-2xl p-4 text-left space-y-2 mb-8">
          {[
            { icon: '📧', text: 'Confirmation sent to your email' },
            { icon: '⏱️', text: 'Review time: 24–48 hours' },
            { icon: '✅', text: 'You can sign in once approved' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm font-medium" style={{ color: '#281812' }}>
              <span>{item.icon}</span> {item.text}
            </div>
          ))}
        </div>
        <button onClick={() => goTo('role')} className="w-full btn-secondary rounded-2xl py-3 font-bold">
          ← Back to Sign In
        </button>
      </div>
    );

    return null;
  };

  return (
    <div className="min-h-screen flex">
      <HeroPanel />
      <div className="flex-1 flex items-center justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-lexend font-black text-lg">N</div>
            <span className="font-lexend font-bold text-2xl" style={{ color: '#281812' }}>NexFood</span>
          </div>
          {renderRight()}
        </div>
      </div>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 font-bold mb-8 hover:opacity-70 transition-opacity"
      style={{ color: '#5c4037' }}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Signing in...
    </span>
  );
}
