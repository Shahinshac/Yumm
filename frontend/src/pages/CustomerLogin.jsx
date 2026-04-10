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
      setError('Google login failed. Please try again or use another account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white font-sans">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/login_hero.png" 
          alt="Premium Food" 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] p-6">
        {/* Customer Auth Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 animate-in fade-in zoom-in duration-500">
           {/* Logo and Greeting */}
           <div className="text-center mb-12">
              <div className="w-20 h-20 bg-[#e23744] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-200">
                <span className="text-white font-black text-3xl">Y</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Login to Yumm</h2>
              <p className="text-gray-400 text-sm font-bold mt-2">Hungry? Your favorite food is a click away.</p>
           </div>

           {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-black border border-red-100 flex items-center gap-3">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</span>
              {error}
            </div>
           )}

           {/* Google Login (Only Option for Customers) */}
           <div className="space-y-8">
              <div id="googleSignInDiv" className="w-full flex justify-center py-2" />
              
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-start gap-4">
                  <ShieldCheck className="text-green-500 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-wider">Secure Access Only</h4>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-1">
                       We use Google's enterprise-grade identity system to keep your data and wallet safe.
                    </p>
                  </div>
              </div>
           </div>

           {/* Link to Partner Login */}
           <div className="mt-12 pt-8 border-t border-gray-50 text-center">
              <p className="text-gray-400 text-xs font-bold mb-4">Are you a restaurant or delivery partner?</p>
              <Link 
                to="/partner-login" 
                className="inline-flex items-center gap-2 text-[#e23744] font-black text-sm hover:underline group"
              >
                Go to Partner Dashboard <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>

        <p className="text-center mt-8 text-[11px] text-white/50 font-bold tracking-widest uppercase cursor-default">
           Privacy First · Security Always
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
