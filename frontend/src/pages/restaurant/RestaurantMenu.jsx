import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Loader2, UtensilsCrossed, X, Upload, Save, ImageIcon } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';

const RestaurantMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Main Course',
    is_veg: true,
    is_available: true,
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
     loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
        const data = await restaurantService.getMenu();
        setItems(data);
    } catch (err) {
        setItems([]);
    } finally {
        setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'veg' ? item.is_veg : !item.is_veg);
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (item = null) => {
    if (item) {
        setEditingItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            description: item.description || '',
            category: item.category || 'Main Course',
            is_veg: item.is_veg,
            is_available: item.is_available,
            image: item.image || ''
        });
        setImagePreview(item.image || null);
    } else {
        setEditingItem(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            category: 'Main Course',
            is_veg: true,
            is_available: true,
            image: ''
        });
        setImagePreview(null);
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
        let imageUrl = formData.image;

        // Handle File Upload
        if (selectedFile) {
            const uploadRes = await restaurantService.uploadImage(selectedFile);
            imageUrl = uploadRes.url;
        }

        const finalData = { ...formData, image: imageUrl };

        if (editingItem) {
            await restaurantService.updateMenuItem(editingItem.id, finalData);
        } else {
            await restaurantService.addMenuItem(finalData);
        }
        
        await loadMenu();
        setShowModal(false);
    } catch (err) {
        alert("Action failed: " + (err.response?.data?.error || err.message));
    } finally {
        setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
        await restaurantService.deleteMenuItem(id);
        await loadMenu();
    } catch (err) {
        alert("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading your menu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove items from your public menu.</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-[#ff4b3a] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-orange-500 transition-all outline-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'veg', 'non-veg'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your menu is empty</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Start by adding your first dish for customers to order.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg shadow-gray-200"
          >
            Create First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${item.is_veg ? 'border-green-500' : 'border-red-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${item.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {item.is_available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 h-8 mb-3">{item.description || 'No description provided.'}</p>
                <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-1 rounded-md mb-4">{item.category || 'General'}</span>
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xl font-black text-gray-900">₹{item.price}</span>
                  <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition active:scale-90"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition active:scale-90"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900">
                        {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Item Name</label>
                            <input 
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition"
                                placeholder="E.g. Paneer Butter Masala"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Price (₹)</label>
                            <input 
                                required
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 uppercase px-1">Description</label>
                        <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition resize-none"
                            placeholder="Briefly describe the ingredients and taste..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition"
                            >
                                <option>Main Course</option>
                                <option>Appetizer</option>
                                <option>Beverage</option>
                                <option>Dessert</option>
                                <option>Healthy</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={formData.is_veg}
                                    onChange={e => setFormData({...formData, is_veg: e.target.checked})}
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${formData.is_veg ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                    {formData.is_veg && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                                </div>
                                <span className={`text-xs font-bold ${formData.is_veg ? 'text-green-600' : 'text-gray-400'}`}>Veg</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={formData.is_available}
                                    onChange={e => setFormData({...formData, is_available: e.target.checked})}
                                />
                                <div className={`w-10 h-5 rounded-full relative transition ${formData.is_available ? 'bg-green-500' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_available ? 'left-6' : 'left-1'}`} />
                                </div>
                                <span className="text-xs font-bold text-gray-500">Available</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase px-1 block">Item Photo</label>
                        {/* Image Preview */}
                        {(imagePreview || selectedFile) && (
                            <div className="relative h-32 rounded-xl overflow-hidden border border-gray-100">
                                <img
                                    src={selectedFile ? URL.createObjectURL(selectedFile) : imagePreview}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setSelectedFile(null); setImagePreview(null); setFormData(d => ({...d, image: ''})); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 hover:bg-gray-50 hover:border-orange-400 transition cursor-pointer group">
                            <ImageIcon className="text-gray-300 group-hover:text-orange-500" size={22} />
                            <span className="text-xs font-bold text-gray-400 group-hover:text-orange-500">
                                {selectedFile ? 'Change Photo' : 'Click to Upload Photo'}
                            </span>
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={e => {
                                    const f = e.target.files[0];
                                    if (f) { setSelectedFile(f); setImagePreview(null); }
                                }}
                                accept="image/*"
                            />
                        </label>
                    </div>

                    <button 
                        disabled={modalLoading}
                        type="submit"
                        className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition flex items-center justify-center gap-2 shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {modalLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
                        {editingItem ? 'Update Item' : 'Create Item'}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
