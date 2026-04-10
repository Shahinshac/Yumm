import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Terminal } from 'lucide-react';

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(identifier, password);
      
      if (data.user.role !== 'admin') {
        setError('Unauthorized Access: This portal is for system administrators only.');
        return;
      }

      login(data.user, data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failure. Check logs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] font-mono relative overflow-hidden">
      {/* Matrix-like subtle background grid or dark theme */}
      <div className="absolute inset-0 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e23744] to-transparent animate-pulse" />

      <div className="relative z-10 w-full max-w-[420px] p-6">
        <div className="bg-[#141414] rounded-[2.5rem] border border-[#222] shadow-[0_0_50px_rgba(226,55,68,0.05)] p-10 lg:p-14 animate-in fade-in zoom-in duration-700">
           {/* Terminal Identity */}
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-[#222] border border-[#333] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Terminal size={32} className="text-[#e23744]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">System Core</h2>
              <p className="text-gray-500 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">Administrator Validation</p>
           </div>

           {error && (
            <div className="mb-8 p-4 bg-red-950/30 text-red-400 rounded-2xl text-[10px] font-black border border-red-900/50 flex items-center gap-3">
              <ShieldCheck size={16} className="shrink-0" />
              {error}
            </div>
           )}

           <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input 
                  type="text" 
                  placeholder="ROOT_ID"
                  className="w-full pl-16 pr-6 py-4 bg-[#1a1a1a] border border-[#333] rounded-[1.25rem] focus:border-[#e23744] text-white transition-all outline-none font-black text-xs tracking-widest"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-16 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
                <input 
                  type={showPw ? 'text' : 'password'} 
                  placeholder="ACCESS_KEY"
                  className="w-full pl-16 pr-14 py-4 bg-[#1a1a1a] border border-[#333] rounded-[1.25rem] focus:border-[#e23744] text-white transition-all outline-none font-black text-xs tracking-widest"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-700 hover:text-white transition"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#e23744] text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl shadow-red-950/20 disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Decrypting...' : 'Authorize Access'}
              </button>
           </form>

           <div className="mt-12 text-center">
              <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest leading-relaxed">
                 Unauthorized access is monitored. <br /> All sessions are logged in the main ledger.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
