import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Globe, Lock, Save, Trash2, Sliders, Info, CreditCard } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Yumm FoodHub',
    maintenance: false,
    serviceFee: 15,
    deliveryBaseFee: 40,
    allowRegistration: true,
    platformEmail: 'admin@yumm.com'
  });

  const SettingItem = ({ icon: Icon, label, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-gray-50/50 transition border-b border-gray-50 last:border-0 first:rounded-t-3xl last:rounded-b-3xl">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-gray-100 rounded-xl text-gray-500">
           <Icon size={20} />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Configuration</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage platform-wide rules, fees, and operational status.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#ff4b3a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <Globe size={18} className="text-[#ff4b3a]" />
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Platform Identity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            <SettingItem 
              icon={Info} 
              label="Site Name" 
              description="Visible in browser tab and emails."
            >
              <input 
                type="text" 
                value={settings.siteName} 
                onChange={e => setSettings({...settings, siteName: e.target.value})}
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold min-w-[200px]"
              />
            </SettingItem>
            <SettingItem 
              icon={Globe} 
              label="Platform Email" 
              description="System notifications will be sent from this."
            >
              <input 
                type="email" 
                value={settings.platformEmail} 
                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold min-w-[200px]"
              />
            </SettingItem>
          </div>
        </div>

        {/* Economics */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <CreditCard size={18} className="text-[#ff4b3a]" />
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Fees & Commission</h3>
          </div>
          <div className="divide-y divide-gray-50">
            <SettingItem 
              icon={Sliders} 
              label="Service Fee (%)" 
              description="Percentage taken from each order total."
            >
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.serviceFee} 
                  className="w-20 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-center"
                />
                <span className="text-gray-400 font-bold">%</span>
              </div>
            </SettingItem>
            <SettingItem 
              icon={CreditCard} 
              label="Base Delivery Fee" 
              description="The starting price for flat-rate deliveries."
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold">₹</span>
                <input 
                  type="number" 
                  value={settings.deliveryBaseFee} 
                  className="w-24 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-center"
                />
              </div>
            </SettingItem>
          </div>
        </div>

        {/* Safety & Access */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden border-orange-100">
          <div className="p-6 border-b border-orange-50 bg-orange-50/30 flex items-center gap-2">
            <Shield size={18} className="text-orange-500" />
            <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-[0.2em]">Maintenance & Security</h3>
          </div>
          <div className="divide-y divide-gray-50">
             <SettingItem 
              icon={Lock} 
              label="Maintenance Mode" 
              description="Temporarily disable all orders for system updates."
            >
              <button 
                onClick={() => setSettings({...settings, maintenance: !settings.maintenance})}
                className={`w-14 h-7 rounded-full transition-colors relative ${settings.maintenance ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenance ? 'left-8' : 'left-1'}`} />
              </button>
            </SettingItem>
            <SettingItem 
              icon={Database} 
              label="Wipe System Data" 
              description="Clear all order history while preserving user accounts."
            >
              <button className="px-4 py-2 border border-red-100 text-red-500 bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                Reset Orders
              </button>
            </SettingItem>
          </div>
        </div>

        <div className="flex items-center gap-3 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
           <Bell size={20} className="text-blue-500" />
           <p className="text-xs text-blue-700 font-medium">
             System changes affect all users immediately. A notification will be broadcasted to partners if maintenance is enabled.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
