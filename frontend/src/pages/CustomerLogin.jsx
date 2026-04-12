import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ShieldCheck, ChevronRight } from 'lucide-react';

const CustomerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Sign-In (Primary for Customers)
    const initializeGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCallbackResponse,
        });

        const googleBtn = document.getElementById("googleSignInDiv");
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: "filled_blue",
            size: "large",
            text: "continue_with",
            shape: "circle",
            width: googleBtn.offsetWidth || 340
          });
        }
      }
    };
    if (window.google) initializeGoogle();
  }, []);

  const handleCallbackResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const data = await authService.googleLogin(response.credential);
      login(data.user, data.access_token);
      navigate('/home');
    } catch (err) {
      const backendError = err.response?.data?.error;
      const details = err.response?.data?.details;
      let errMsg = backendError || 'Google login failed. Please try again or use another account.';
      if (details) errMsg += ` (${details})`;
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left Side: Brand & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#e23744] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" 
            alt="Premium Food" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#e23744] via-[#e23744]/90 to-black/40" />
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl">
            <span className="text-[#e23744] font-black text-5xl">Y</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-6">
            Everything you <br /> love, <span className="text-white/70 italic">delivered.</span>
          </h1>
          <p className="text-xl font-medium text-white/80 leading-relaxed mb-8">
            Experience the finest food from your favorite local restaurants, delivered fresh and fast to your doorstep.
          </p>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#e23744] bg-white flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
             </div>
             <p className="text-sm font-bold text-white/90">Joined by 10,000+ local foodies</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center">
           <div className="w-16 h-16 bg-[#e23744] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
             <span className="text-white font-black text-2xl">Y</span>
           </div>
        </div>

        <div className="w-full max-w-[440px] space-y-10">
           <div className="text-center lg:text-left">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Welcome back</h2>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Customer Portal Access</p>
           </div>

           {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-3xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</span>
              {error}
            </div>
           )}

           <div className="space-y-8">
               <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <p className="text-center text-sm text-gray-500 font-bold mb-6 italic">Quick & Secure Login</p>
                <div id="googleSignInDiv" className="w-full flex justify-center py-2 scale-110" />
              </div>
              
              <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-start gap-4 shadow-sm">
                  <ShieldCheck className="text-green-500 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-wider">Enterprise Security</h4>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-1">
                       Your account is protected by Google’s industry-leading security infrastructure.
                    </p>
                  </div>
              </div>
           </div>

           {/* Link to Partner Login */}
           <div className="pt-10 border-t border-gray-100 text-center lg:text-left">
              <p className="text-gray-400 text-xs font-bold mb-4">Are you a restaurant or delivery partner?</p>
              <Link 
                to="/partner-login" 
                className="inline-flex items-center gap-2 text-[#e23744] font-black text-sm hover:underline group"
              >
                Go to Partner Dashboard <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
