import React, { useState, useEffect, useRef } from 'react';
import { Settings, Store, Clock, MapPin, Save, Globe, Phone, FileText, Loader2, Power, CreditCard, CheckCircle, QrCode, Camera, Upload, X } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { QRCodeSVG } from 'qrcode.react';

const RestaurantSettings = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [upiInput, setUpiInput] = useState('');
    const [upiSaving, setUpiSaving] = useState(false);
    const [upiSaved, setUpiSaved] = useState(false);
    const [restPhoto, setRestPhoto] = useState(null); // current photo URL
    const [photoFile, setPhotoFile] = useState(null); // new file to upload
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef(null);

    useEffect(() => {
        restaurantService.getProfile().then(res => {
            const p = res.profile || {};
            setProfile({
                name: p.name || '',
                category: p.category || '',
                address: p.address || '',
                min_order: p.min_order || 0,
                delivery_time: p.delivery_time || 0,
                phone: p.phone || '',
                is_open: p.is_open !== undefined ? p.is_open : true,
                special_offer: p.special_offer || '',
                offer_active: p.offer_active || false,
                upi_id: p.upi_id || ''
            });
            setUpiInput(p.upi_id || '');
            setRestPhoto(p.image || null);
        }).catch(() => {
            setProfile({ name: '', category: '', address: '', min_order: 0, delivery_time: 0, phone: '', is_open: true, special_offer: '', offer_active: false, upi_id: '' });
        }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await restaurantService.updateProfile(profile);
            alert('Settings updated successfully!');
        } catch {
            alert('Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (file) => {
        if (!file) return;
        setPhotoUploading(true);
        try {
            const res = await restaurantService.uploadImage(file);
            await restaurantService.updateProfile({ image: res.url });
            setRestPhoto(res.url);
            setPhotoFile(null);
        } catch {
            alert('Photo upload failed.');
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleSaveUpi = async () => {
        setUpiSaving(true);
        try {
            await restaurantService.updateProfile({ upi_id: upiInput.trim() });
            setProfile(p => ({ ...p, upi_id: upiInput.trim() }));
            setUpiSaved(true);
            setTimeout(() => setUpiSaved(false), 3000);
        } catch {
            alert('Failed to save UPI ID.');
        } finally {
            setUpiSaving(false);
        }
    };

    const upiQrValue = profile?.upi_id
        ? `upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(profile.name || 'Restaurant')}&cu=INR`
        : '';

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
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage your restaurant identity, operations, and payments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setProfile({ ...profile, is_open: !profile.is_open })}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${profile.is_open ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`}
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

            {/* Store Identity */}
            <Section title="Store Identity" icon={Store}>
                {/* Restaurant Photo */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="relative shrink-0">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-gray-100 shadow-md bg-gray-50">
                            {(photoFile ? URL.createObjectURL(photoFile) : restPhoto) ? (
                                <img
                                    src={photoFile ? URL.createObjectURL(photoFile) : restPhoto}
                                    alt="Restaurant"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Store size={32} className="text-gray-300" />
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#ff4b3a] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition"
                        >
                            <Camera size={14} />
                        </button>
                        <input
                            type="file"
                            ref={photoInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={e => {
                                const f = e.target.files[0];
                                if (f) setPhotoFile(f);
                            }}
                        />
                    </div>
                    <div className="flex-1 space-y-3">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Restaurant Photo</p>
                        <p className="text-[11px] text-gray-400 font-medium">This photo is displayed on the customer homepage. Use a high-quality image of your food or storefront.</p>
                        {photoFile && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handlePhotoUpload(photoFile)}
                                    disabled={photoUploading}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#ff4b3a] text-white rounded-xl font-black text-xs shadow-md hover:bg-red-600 disabled:opacity-50 transition"
                                >
                                    {photoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    {photoUploading ? 'Uploading...' : 'Save Photo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPhotoFile(null)}
                                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-500 rounded-xl font-black text-xs hover:bg-gray-200 transition"
                                >
                                    <X size={12} /> Cancel
                                </button>
                            </div>
                        )}
                        {restPhoto && !photoFile && (
                            <p className="text-[10px] text-green-600 font-bold">✓ Photo uploaded and visible to customers</p>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-50 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Restaurant Name" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} icon={Store} />
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4">
                        <div>
                            <p className="text-xs font-bold text-gray-900">Accepting Orders</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Toggle store status</p>
                        </div>
                        <button
                            onClick={() => setProfile({ ...profile, is_open: !profile.is_open })}
                            className={`w-12 h-6 rounded-full transition-all relative ${profile.is_open ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.is_open ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
                </div>
            </Section>

            {/* 💳 UPI / Payments Section */}
            <Section title="Payment & UPI" icon={CreditCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Your UPI ID</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    value={upiInput}
                                    onChange={e => setUpiInput(e.target.value)}
                                    placeholder="yourname@upi or phone@paytm"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-bold text-gray-900"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1">
                                E.g: <span className="text-gray-600 font-bold">8891234567@paytm</span> or <span className="text-gray-600 font-bold">name@okaxis</span>
                            </p>
                        </div>
                        <button
                            onClick={handleSaveUpi}
                            disabled={upiSaving || !upiInput.trim()}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg disabled:opacity-50 ${upiSaved ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-900 text-white shadow-gray-200 hover:bg-black'}`}
                        >
                            {upiSaving ? <Loader2 className="animate-spin" size={16} /> : upiSaved ? <CheckCircle size={16} /> : <Save size={16} />}
                            {upiSaved ? 'Saved!' : upiSaving ? 'Saving...' : 'Save UPI ID'}
                        </button>

                        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-800 font-medium space-y-1">
                            <p className="font-black text-blue-900">How it works:</p>
                            <p>• Customers choosing UPI will see this QR to pay you directly</p>
                            <p>• COD orders: delivery agent shows this QR to collect payment</p>
                            <p>• You verify payment received before accepting the order</p>
                        </div>
                    </div>

                    {/* Live QR Preview */}
                    <div className="flex flex-col items-center justify-center">
                        {profile.upi_id && upiQrValue ? (
                            <div className="text-center space-y-3">
                                <div className="p-4 bg-white rounded-3xl shadow-xl border border-gray-100 inline-block">
                                    <QRCodeSVG
                                        value={upiQrValue}
                                        size={160}
                                        bgColor="#ffffff"
                                        fgColor="#1a1a1a"
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Payment QR</p>
                                <p className="text-xs font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl">{profile.upi_id}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center">
                                <QrCode size={40} className="text-gray-300 mb-3" />
                                <p className="text-sm font-bold text-gray-400">QR preview will appear here</p>
                                <p className="text-xs text-gray-300 mt-1">Enter your UPI ID and save</p>
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            {/* Special Offers */}
            <Section title="Special Offers" icon={FileText}>
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between p-6 bg-orange-50 rounded-[2rem] border border-orange-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl text-[#ff4b3a] shadow-sm">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest">Active Store Offer</h4>
                                <p className="text-[10px] text-orange-800/60 font-bold uppercase mt-1">Shown to all customers on your menu page.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setProfile({ ...profile, offer_active: !profile.offer_active })}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${profile.offer_active ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-500'}`}
                        >
                            {profile.offer_active ? 'OFFER ON' : 'OFFER OFF'}
                        </button>
                    </div>

                    {profile.offer_active && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <InputField
                                label="Offer Message"
                                value={profile.special_offer}
                                onChange={v => setProfile({ ...profile, special_offer: v })}
                                icon={FileText}
                                placeholder="e.g. 10% OFF ON ALL ORDERS ABOVE ₹500"
                            />
                        </div>
                    )}
                </div>
            </Section>

            {/* Operations */}
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
                                    onChange={e => setProfile({ ...profile, min_order: e.target.value })}
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
                                    onChange={e => setProfile({ ...profile, delivery_time: e.target.value })}
                                    className="w-20 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-sm font-black text-center"
                                />
                            </div>
                        </div>
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
