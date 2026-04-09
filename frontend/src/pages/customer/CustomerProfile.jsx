import React from 'react';
import { User, Mail, Phone, MapPin, Shield, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerProfile = () => {
  const { user, logout } = useAuth();

  const initials = (user?.full_name || user?.username || 'U').slice(0, 2).toUpperCase();

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
    <div className="max-w-xl mx-auto pb-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-24 h-24 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-100 mb-4 border-4 border-white">
          {initials}
        </div>
        <h1 className="text-2xl font-black text-gray-900">{user?.full_name || user?.username}</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <Shield size={14} className="text-green-500" /> Verified Customer
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-[#ff4b3a]" /> Personal Info
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="p-4 flex items-center gap-4">
              <Mail size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <Phone size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <MapPin size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Address</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.address || 'No address saved'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Account */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
          <MenuItem icon={User} label="Edit Profile" sub="Update your personal details" />
          <MenuItem icon={MapPin} label="Manage Addresses" sub="Home, Office, others" />
          <MenuItem icon={Settings} label="Preferences" sub="Dark mode, Notifications" />
          <MenuItem icon={LogOut} label="Log Out" sub="Sign out of your account" onClick={logout} danger />
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
