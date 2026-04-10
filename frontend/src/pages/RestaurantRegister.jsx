import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
    Store, User, Mail, Phone, MapPin, ArrowLeft, 
    Loader2, CheckCircle2, ShieldCheck, Zap, TrendingUp, Users
} from 'lucide-react';

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shop_name: '',
    category: 'Restaurant',
    address: '',
    id_proof_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      value = value.replace(/\s/g, ''); 
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await authService.uploadIdentityProof(data);
      setFormData(prev => ({ ...prev, id_proof_url: res.url }));
    } catch (err) {
      setError('Failed to upload ID Proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!formData.id_proof_url) {
      setError('Please upload an ID Proof for verification');
      return;
    }

    setLoading(true);
    try {
      await authService.registerRestaurant(formData);
      setSuccess(true);
    } catch (err) {
      setError('Registration failed. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg text-center border-8 border-gray-100/50">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Received!</h2>
          <div className="space-y-4 mb-10 text-left bg-gray-50 p-6 rounded-3xl">
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]">1</div>
                <p className="text-xs text-gray-600 font-bold">Registration submitted successfully</p>
             </div>
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-orange-400 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]">2</div>
                <p className="text-xs text-gray-800 font-black italic">Verification Team is reviewing your documents (24-48h)</p>
             </div>
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]">3</div>
                <p className="text-xs text-gray-400 font-medium">Menu setup and Go-Live call</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#1c1c1c] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition shadow-xl"
          >
            Go to Partner Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="px-6 py-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e23744] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Y</span>
            </div>
            <span className="text-[#e23744] font-black text-xl tracking-tight">Yumm <span className="text-gray-300 font-medium">for Business</span></span>
          </Link>
          <Link to="/login" className="text-xs font-black uppercase tracking-widest text-[#e23744] hover:underline">Log In</Link>
      </nav>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        
        {/* Left: Info Section (Zomato Style) */}
        <div className="lg:w-[45%] bg-[#1c1c1c] p-12 lg:p-24 text-white flex flex-col justify-center">
             <h2 className="text-4xl lg:text-6xl font-black leading-tight mb-8">
                Grow your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">food business</span> <br />
                exponentially.
             </h2>
             <p className="text-gray-400 text-lg mb-16 font-medium leading-relaxed">
                Join thousands of restaurants who have grown their revenue by 3x after partnering with Yumm Logistics.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                    { icon: <TrendingUp className="text-orange-400" />, title: "30% Revenue Lift", desc: "Proven growth in delivery sales." },
                    { icon: <Users className="text-blue-400" />, title: "5M+ Active Foodies", desc: "Get exposure to local customers." },
                    { icon: <Zap className="text-yellow-400" />, title: "30min Delivery", desc: "The fastest fleet in the country." },
                    { icon: <ShieldCheck className="text-green-400" />, title: "Seamless Ops", desc: "Advanced order management tools." }
                 ].map((perk, i) => (
                    <div key={i} className="space-y-2">
                        <div className="p-2 bg-white/5 rounded-xl w-fit">{perk.icon}</div>
                        <h4 className="text-xs font-black uppercase tracking-widest">{perk.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold leading-normal">{perk.desc}</p>
                    </div>
                 ))}
             </div>
        </div>

        {/* Right: Registration Form */}
        <div className="flex-1 p-8 lg:p-24 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="mb-10">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">Register with Yumm</h3>
                    <p className="text-gray-400 text-sm font-bold">Standard onboarding usually takes 48 hours.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                        <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Owner Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="business@example.com"
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                            <input
                                type="text"
                                name="shop_name"
                                value={formData.shop_name}
                                onChange={handleChange}
                                placeholder="Brand Name"
                                required
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cuisine Type</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm appearance-none"
                            >
                                <option value="Restaurant">Fine Dining</option>
                                <option value="Bakery">Bakery / Sweets</option>
                                <option value="Cafe">Cafe / Roasteries</option>
                                <option value="Fast Food">Quick Service (QSR)</option>
                                <option value="Desserts">Ice Creams / Shakes</option>
                                <option value="Beverages">Fresh Juices</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Proof (Aadhaar / License)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="id-upload"
                            />
                            <label 
                                htmlFor="id-upload"
                                className={`w-full flex items-center justify-between px-5 py-4 bg-gray-50 border-2 border-dashed rounded-2xl cursor-pointer hover:border-[#e23744] transition-all ${formData.id_proof_url ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                            >
                                <span className={`text-sm font-bold ${formData.id_proof_url ? 'text-green-700' : 'text-gray-400'}`}>
                                    {uploading ? 'Uploading...' : formData.id_proof_url ? 'Document Attached ✓' : 'Click to upload ID photo'}
                                </span>
                                <ShieldCheck className={formData.id_proof_url ? 'text-green-500' : 'text-gray-300'} size={20} />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location / Store Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Complete address with landmarks..."
                            required
                            rows="3"
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm resize-none"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-[#e23744] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#c12f3a] transition shadow-xl shadow-red-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit for Review'}
                    </button>

                    <p className="text-center text-[10px] text-gray-400 font-bold max-w-xs mx-auto mt-6">
                        By submitting, you agree to Yumm Business Partner Terms and our automated verification protocols.
                    </p>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;
