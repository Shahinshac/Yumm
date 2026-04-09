import React, { useState, useEffect } from 'react';
import { Settings, Store, Clock, Image as ImageIcon, MapPin, Save, Globe, Phone, FileText, Loader2, Power } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantSettings = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        restaurantService.getProfile().then(res => {
            setProfile(res.profile || {
                name: 'Paragon Restaurant',
                category: 'Biryani & Kerala',
                address: '123 Food Street, Malappuram',
                min_order: 200,
                delivery_time: 30,
                phone: '+91 9876543210',
                is_open: true
            });
        }).catch(() => {
            setProfile({
                name: 'Paragon Restaurant',
                category: 'Biryani & Kerala',
                address: '123 Food Street, Malappuram',
                min_order: 200,
                delivery_time: 30,
                phone: '+91 9876543210',
                is_open: true
            });
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await restaurantService.updateProfile(profile);
            alert('Settings updated successfully!');
        } catch {
            alert('Failed to update settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Loading store configuration...</p>
            </div>
        );
    }

    const Section = ({ title, icon: Icon, children }) => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl text-[#ff4b3a] shadow-sm border border-gray-100">
                        <Icon size={20} />
                    </div>
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">{title}</h3>
                </div>
            </div>
            <div className="p-8 space-y-6">
                {children}
            </div>
        </div>
    );

    const InputField = ({ label, value, type = "text", onChange, placeholder, icon: Icon }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff4b3a] transition-colors leading-none">
                    <Icon size={18} />
                </div>
                <input 
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-bold text-gray-900"
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Store Settings</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage your restaurant identity and operational rules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                         onClick={() => setProfile({...profile, is_open: !profile.is_open})}
                         className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${
                            profile.is_open ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'
                         }`}
                    >
                        <Power size={14} /> {profile.is_open ? 'Open Now' : 'Closed'}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#ff4b3a] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <Section title="Store Identity" icon={Store}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Restaurant Name" value={profile.name} onChange={v => setProfile({...profile, name: v})} icon={Store} />
                    <InputField label="Category" value={profile.category} onChange={v => setProfile({...profile, category: v})} icon={FileText} />
                </div>
                <InputField label="Street Address" value={profile.address} onChange={v => setProfile({...profile, address: v})} icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Contact Phone" value={profile.phone} onChange={v => setProfile({...profile, phone: v})} icon={Phone} />
                    <InputField label="Website (Optional)" value="" onChange={() => {}} icon={Globe} placeholder="https://..." />
                </div>
            </Section>

            <Section title="Operations" icon={Clock}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-900">Minimum Order</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Threshold for delivery</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    value={profile.min_order} 
                                    onChange={e => setProfile({...profile, min_order: e.target.value})}
                                    className="w-20 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-black text-center"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-900">Est. Delivery Time</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Minutes to reach customer</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={profile.delivery_time} 
                                    onChange={e => setProfile({...profile, delivery_time: e.target.value})}
                                    className="w-20 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-black text-center"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-red-50/50 border border-red-100 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center">
                         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-[#ff4b3a] shadow-sm mb-4 border border-red-50">
                            <ImageIcon size={32} />
                         </div>
                         <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-1">Store Banner</h4>
                         <p className="text-[10px] text-red-800/60 font-bold mb-4 uppercase">Max 2MB, JPG/PNG</p>
                         <button className="px-4 py-2 bg-[#ff4b3a] text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-100">
                             Upload Photo
                         </button>
                    </div>
                </div>
            </Section>

            <div className="flex items-center gap-4 p-6 bg-gray-900 rounded-[2rem] text-white">
                 <div className="p-3 bg-white/10 rounded-2xl text-[#ff4b3a]">
                    <Settings size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Security & Privacy</h4>
                    <p className="text-xs text-gray-400 font-medium">To change your email or password, please contact the system administrator.</p>
                 </div>
            </div>
        </div>
    );
};

export default RestaurantSettings;
