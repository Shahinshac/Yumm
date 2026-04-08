import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'partner'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePartnerLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await authService.login(email, password);
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleMockGoogleLogin = async () => {
    // Since Google OAuth requires actual browser validation, we're using the mock token 
    // that the backend supports for testing customer auth.
    try {
      const data = await authService.googleLogin('mock_test_user');
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError('Google Login simulation failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#ff4b3a]">FoodHub</h1>
          <p className="text-gray-500 mt-2">Welcome back! Please login.</p>
        </div>

        <div className="flex mb-6 border-b">
          <button 
            className={`flex-1 pb-2 font-medium ${activeTab === 'customer' ? 'text-[#ff4b3a] border-b-2 border-[#ff4b3a]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('customer')}
          >
            Customer
          </button>
          <button 
            className={`flex-1 pb-2 font-medium ${activeTab === 'partner' ? 'text-[#ff4b3a] border-b-2 border-[#ff4b3a]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('partner')}
          >
            Restaurant / Delivery
          </button>
        </div>

        {error && <div className="mb-4 bg-red-100 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        {activeTab === 'customer' ? (
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleMockGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
              Sign in with Google
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              (For development, this uses the backend mock token)
            </p>
          </div>
        ) : (
          <form onSubmit={handlePartnerLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#ff4b3a]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#ff4b3a]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#ff4b3a] text-white py-3 rounded-lg font-medium hover:bg-[#e03d2e] transition mt-2"
            >
              Partner Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
