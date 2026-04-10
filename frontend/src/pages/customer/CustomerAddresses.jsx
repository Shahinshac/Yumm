import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Navigation, Loader2, Save, X } from 'lucide-react';
import { customerService } from '../../services/customerService';

const CustomerAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ type: 'home', address: '', landmark: '' });

    useEffect(() => {
        customerService.getAddresses().then(res => {
            setAddresses(res.addresses || []);
        }).catch(() => {
            setAddresses([]);
        }).finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        try {
            await customerService.deleteAddress(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch {}
    };

    const handleSave = async () => {
        try {
            await customerService.saveAddress(newAddress);
            setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
            setShowAddModal(false);
            setNewAddress({ type: 'home', address: '', landmark: '' });
        } catch {}
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'home': return <Home size={18} />;
            case 'office': return <Briefcase size={18} />;
            default: return <Navigation size={18} />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
                <p className="text-gray-500 font-bold text-sm text-[#ff4b3a]">Fetching your saved locations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Addresses</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage your delivery locations for faster checkout.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#ff4b3a] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={16} /> Add New Address
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 ? (
                    <div className="md:col-span-2 py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center">
                        <MapPin size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-medium">No saved addresses yet.</p>
                    </div>
                ) : (
                    addresses.map(addr => (
                        <div key={addr.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${addr.type === 'home' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                    {getTypeIcon(addr.type)}
                                </div>
                                <button 
                                    onClick={() => handleDelete(addr.id)}
                                    className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-2">{addr.type}</h3>
                            <p className="text-gray-600 font-medium text-sm leading-relaxed mb-4">
                                {addr.address}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                <Navigation size={12} className="text-[#ff4b3a]" /> {addr.landmark}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal Placeholder */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 relative animate-in zoom-in duration-200 shadow-2xl">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100">
                            <X size={20} className="text-gray-400" />
                        </button>
                        <h2 className="text-xl font-black text-gray-900 mb-6 font-[#ff4b3a]">Add New Location</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                {['home', 'office', 'other'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setNewAddress({...newAddress, type: t})}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            newAddress.type === t ? 'bg-[#ff4b3a] text-white' : 'bg-gray-100 text-gray-400'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                                <textarea 
                                    placeholder="Enter your street, building and floor details..."
                                    value={newAddress.address}
                                    onChange={e => setNewAddress({...newAddress, address: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-medium min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Near KFC"
                                    value={newAddress.landmark}
                                    onChange={e => setNewAddress({...newAddress, landmark: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#ff4b3a] transition-all outline-none text-sm font-medium"
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                className="w-full py-4 bg-[#ff4b3a] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-200"
                            >
                                Save Address
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerAddresses;
