import React, { useState } from 'react';
import { ChevronLeft, Bell, Moon, Shield, Save, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerPreferences = () => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    emailNotifs: true,
    pushNotifs: true,
    darkMode: false,
    promos: true
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
        <div>
            <p className="font-bold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-[#ff4b3a]' : 'bg-gray-200'}`}
        >
            <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
        <div className="mb-8">
            <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-[#ff4b3a] transition-all font-bold text-sm">
                <ChevronLeft size={20} /> Back to Profile
            </Link>
            <h1 className="text-2xl font-black text-gray-900 mt-6">Preferences</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Manage your notifications and app settings.</p>
        </div>

        <div className="space-y-6">
            <div>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2"><Bell size={14} /> Notifications</h2>
                <Toggle 
                    label="Order Updates" 
                    desc="Receive push notifications about your delivery status" 
                    checked={prefs.pushNotifs} 
                    onChange={v => setPrefs({...prefs, pushNotifs: v})} 
                />
                <Toggle 
                    label="Promotions & Offers" 
                    desc="Get emails about special discounts and new restaurants" 
                    checked={prefs.promos} 
                    onChange={v => setPrefs({...prefs, promos: v})} 
                />
                <Toggle 
                    label="Email Receipts" 
                    desc="Send order receipts to your registered email address" 
                    checked={prefs.emailNotifs} 
                    onChange={v => setPrefs({...prefs, emailNotifs: v})} 
                />
            </div>

            <div>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2"><Moon size={14} /> Appearance</h2>
                <Toggle 
                    label="Dark Mode" 
                    desc="Switch to a dark UI theme (Coming Soon)" 
                    checked={prefs.darkMode} 
                    onChange={v => setPrefs({...prefs, darkMode: v})} 
                />
            </div>

            <button 
                onClick={handleSave}
                disabled={loading || saved}
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                    saved 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                    : 'bg-[#ff4b3a] hover:bg-[#e03d2e] text-white shadow-lg shadow-red-100 disabled:opacity-50'
                }`}
            >
                {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
                {saved ? 'Preferences Saved!' : loading ? 'Saving...' : 'Save Preferences'}
            </button>
        </div>
    </div>
  );
}

export default CustomerPreferences;
