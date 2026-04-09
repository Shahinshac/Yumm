import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Eye, EyeOff, ChevronRight, Bike, Store, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [tab, setTab] = useState('customer'); // 'customer' | 'partner'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePartnerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(identifier, password);
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Sign-In
    const initializeGoogle = () => {
      if (window.google && tab === 'customer') {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here.apps.googleusercontent.com",
          callback: handleCallbackResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const googleBtn = document.getElementById("googleSignInDiv");
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: googleBtn.offsetWidth || 400
          });
        }
      }
    };

    // Load or wait for script
    if (window.google) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [tab]);

  const handleCallbackResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const data = await authService.googleLogin(response.credential);
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      console.error('Google Login Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // This is now handled by the Google rendered button, 
    // but kept as a fallback or for custom trigger if needed
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT — Branding Panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ff4b3a 0%, #ff8c42 60%, #ffd166 100%)' }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-black text-lg">Y</span>
            </div>
            <span className="text-white font-black text-2xl tracking-tight">Yumm</span>
          </div>
        </div>

        <div className="relative z-10 p-12 pb-16">
          <h2 className="text-white font-black text-5xl leading-tight mb-6">
            Food at your<br />
            <span className="text-yellow-200">doorstep,</span><br />
            always.
          </h2>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            Discover the best restaurants, track your delivery in real-time, and enjoy every meal with ease.
          </p>

          <div className="flex gap-8 mt-10">
            {[
              { num: '500+', label: 'Restaurants' },
              { num: '10K+', label: 'Happy Customers' },
              { num: '30 min', label: 'Avg Delivery' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-white font-black text-2xl">{stat.num}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
      </div>

      {/* RIGHT — Auth Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 bg-white">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="w-8 h-8 bg-[#ff4b3a] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">Y</span>
          </div>
          <span className="text-[#ff4b3a] font-black text-xl">Yumm</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Welcome back 👋</h1>
          <p className="text-gray-500 mb-8">Login to continue ordering great food</p>

          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            {[
              { key: 'customer', label: 'Customer' },
              { key: 'partner', label: 'Partner / Admin' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* CUSTOMER TAB */}
          {tab === 'customer' && (
            <div className="space-y-4">
              <div 
                id="googleSignInDiv" 
                className="w-full flex justify-center py-1 transition-all duration-200"
              >
                {/* Google Button renders here */}
              </div>

              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">New to Yumm?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 text-center">
                Your first order? Just sign in with Google—we'll take care of the rest!
              </div>
            </div>
          )}

          {/* PARTNER / ADMIN TAB */}
          {tab === 'partner' && (
            <form onSubmit={handlePartnerLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="you@example.com or username"
                  required
                  autoComplete="username"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 outline-none focus:border-[#ff4b3a] transition-colors duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-gray-900 placeholder-gray-400 outline-none focus:border-[#ff4b3a] transition-colors duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Admin hint */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-500" />
                <span>
                  <strong>Admin access:</strong> Use <code className="bg-blue-100 px-1 rounded">shahinsha@fooddelivery.com</code> and password <code className="bg-blue-100 px-1 rounded">262007food</code>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff4b3a] hover:bg-[#e03d2e] active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Logging in...
                  </span>
                ) : 'Login →'}
              </button>

              {/* Registration links */}
              <div className="border-t pt-5">
                <p className="text-xs text-center text-gray-500 mb-3 font-medium uppercase tracking-wide">Join as a partner</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/register/restaurant"
                    className="flex items-center justify-center gap-2 py-3 px-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-[#ff4b3a] hover:text-[#ff4b3a] transition-all duration-200 group"
                  >
                    <Store size={16} className="group-hover:scale-110 transition" />
                    Restaurant
                  </Link>
                  <Link
                    to="/register/delivery"
                    className="flex items-center justify-center gap-2 py-3 px-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-[#ff4b3a] hover:text-[#ff4b3a] transition-all duration-200 group"
                  >
                    <Bike size={16} className="group-hover:scale-110 transition" />
                    Delivery
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
