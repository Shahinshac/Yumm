import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Eye, EyeOff, Store, Bike, Mail, Lock, ChevronLeft } from 'lucide-react';

const PartnerLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(identifier, password);
      login(data.user, data.access_token);
      
      const rolePaths = {
        restaurant: '/restaurant/dashboard',
        delivery: '/delivery/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(rolePaths[data.user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Check your secret key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white font-sans">
      <div className="absolute inset-0 bg-[#f8fafc]" />
      
      <div className="relative z-10 w-full max-w-[500px] p-6">
        <Link to="/login" className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-gray-900 font-bold text-xs transition-all uppercase tracking-widest">
           <ChevronLeft size={16} /> Back to Customer Portal
        </Link>

        {/* Partner Auth Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-14 animate-in fade-in slide-in-from-bottom duration-500 border border-gray-100">
           {/* Logo and Greeting */}
           <div className="mb-10 sm:text-left text-center">
              <div className="w-14 h-14 bg-[#e23744] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-100 mx-auto sm:mx-0">
                <span className="text-white font-black text-xl">Y</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Partner Dashboard</h2>
              <p className="text-gray-400 text-sm font-bold mt-2 leading-relaxed">Secure access for merchants and riders.</p>
           </div>

           {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-black border border-red-100 flex items-center gap-3 animate-shake">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</span>
              {error}
            </div>
           )}

           {/* Manual Login Form */}
           <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#e23744] transition" size={18} />
                <input 
                  type="text" 
                  placeholder="Official ID / Registered Email"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:border-[#e23744] focus:bg-white transition-all outline-none font-bold text-sm"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#e23744] transition" size={18} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="Access Key"
                  className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:border-[#e23744] focus:bg-white transition-all outline-none font-bold text-sm"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[#e23744] text-white rounded-[1.25rem] font-bold text-sm uppercase tracking-widest hover:bg-black transition shadow-xl shadow-red-100/50 disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
           </form>

           {/* Test Mode Quick Access */}
           <div className="mt-8 p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Quick Test Access</p>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => { setIdentifier('admin'); setPassword('admin123'); }}
                  className="w-full py-2 bg-white border border-blue-200 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition shadow-sm"
                 >
                   Autofill Admin
                 </button>
              </div>
           </div>

           {/* Onboarding Links */}
           <div className="mt-8 pt-6 border-t border-gray-50 flex gap-4 w-full">
              <Link to="/register/restaurant" className="flex-1 p-4 bg-white rounded-2xl border-2 border-gray-50 hover:border-[#e23744] transition-all flex flex-col items-center text-center gap-2">
                <Store size={20} className="text-[#e23744]" />
                <span className="text-[10px] font-black uppercase text-gray-900 leading-none tracking-tighter">List Restaurant</span>
              </Link>
              <Link to="/register/delivery" className="flex-1 p-4 bg-white rounded-2xl border-2 border-gray-50 hover:border-[#e23744] transition-all flex flex-col items-center text-center gap-2">
                <Bike size={20} className="text-[#e23744]" />
                <span className="text-[10px] font-black uppercase text-gray-900 leading-none tracking-tighter">Become a Rider</span>
              </Link>
           </div>
        </div>

        <p className="text-center mt-12 text-[10px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-relaxed">
           Proprietary Infrastructure • Version 2.4.0 <br /> Global Fleet Operations
        </p>
      </div>
    </div>
  );
};

export default PartnerLogin;
