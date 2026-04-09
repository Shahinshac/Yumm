import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, LogOut, ChevronRight, Settings, Edit3, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const CustomerProfile = () => {
  const { user, logout, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initials = (user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const resp = await authService.updateProfile(formData);
      // Update local context so UI reflects changes
      login(resp.user, localStorage.getItem('token'));
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setMessage('');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const MenuItem = ({ icon: Icon, label, sub, onClick, danger }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition border-b border-gray-50 last:border-0 first:rounded-t-2xl last:rounded-b-2xl"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className={`font-bold text-sm ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {!danger && <ChevronRight size={16} className="text-gray-300" />}
    </button>
  );

  return (
    <div className="max-w-xl mx-auto pb-12 relative">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative group">
          <div className="w-24 h-24 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-100 mb-4 border-4 border-white transition-transform group-hover:scale-105">
            {initials}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-4 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-[#ff4b3a] transition"
          >
            <Edit3 size={14} />
          </button>
        </div>
        <h1 className="text-2xl font-black text-gray-900">{user?.full_name || user?.username}</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 font-medium">
          <Shield size={14} className="text-green-500" /> Verified Customer
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-[#ff4b3a]" /> Personal Info
            </h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-[#ff4b3a] hover:underline"
            >
              Edit Info
            </button>
          </div>
          <div className="divide-y divide-gray-50 px-6 py-2">
            <div className="py-4 flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Mail size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>
            <div className="py-4 flex items-center gap-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><Phone size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="py-4 flex items-center gap-4">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><MapPin size={18} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Address</p>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{user?.address || 'No address saved'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <MenuItem icon={User} label="Edit Profile" sub="Update your name and phone number" onClick={() => setIsEditing(true)} />
          <MenuItem icon={MapPin} label="Manage Addresses" sub="Home, Office, others" />
          <MenuItem icon={Settings} label="Preferences" sub="App settings & notifications" />
          <MenuItem icon={LogOut} label="Log Out" sub="Sign out of your account" onClick={logout} danger />
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              {message && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {message.includes('success') ? <CheckCircle2 size={16} /> : <X size={16} />}
                  {message}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#ff4b3a] transition outline-none font-medium text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                <input 
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#ff4b3a] transition outline-none font-medium text-sm"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Delivery Address</label>
                <textarea 
                  rows="3"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#ff4b3a] transition outline-none font-medium text-sm resize-none"
                  placeholder="Street, Landmark, City..."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff4b3a] text-white py-4 rounded-2xl font-black mt-4 hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;
