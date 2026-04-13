import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
    Bike, Phone, Loader2, CheckCircle2, ShieldCheck, Banknote, Clock, MapPin
} from 'lucide-react';

const DeliveryRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_type: 'bike'
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }


    setLoading(true);
    try {
      await authService.registerDelivery(formData);
      setSuccess(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please check your connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg text-center border-8 border-gray-100/50">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <CheckCircle2 className="w-12 h-12 text-[#e23744]" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Application Logged!</h2>
          <div className="space-y-4 mb-10 text-left bg-gray-50 p-6 rounded-3xl">
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-[#e23744] rounded-full shrink-0 flex items-center justify-center text-white text-[10px]">✓</div>
                <p className="text-xs text-gray-600 font-bold">Profile received and queued</p>
             </div>
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-orange-400 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] animate-bounce">!</div>
                <p className="text-xs text-gray-800 font-black">Documentation verification in progress (24h)</p>
             </div>
             <div className="flex gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]">?</div>
                <p className="text-xs text-gray-400 font-medium">Training materials will be sent over email</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#1c1c1c] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition shadow-xl"
          >
            Check Status at Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="px-6 py-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e23744] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">Y</span>
            </div>
            <span className="text-[#e23744] font-black text-xl tracking-tight">Yumm <span className="text-gray-300 font-medium tracking-tight">Delivery Partner</span></span>
          </Link>
          <Link to="/login" className="text-xs font-black uppercase tracking-widest text-[#e23744] hover:underline">Log In</Link>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Rider Perks */}
        <div className="lg:w-[40%] bg-[#e23744] p-12 lg:p-24 text-white flex flex-col justify-center">
             <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-12">
                Drive more, <br />
                <span className="text-white/40">earn</span> more. <br />
                On your own <br />
                terms.
             </h2>

             <div className="space-y-10">
                 {[
                    { icon: <Banknote className="text-[#e23744]" />, title: "Weekly Payouts", desc: "No delays. Get your earnings directly in your bank account every week." },
                    { icon: <Clock className="text-[#e23744]" />, title: "Flexible Shifts", desc: "Choose when you want to work. Morning, late-night, or weekends." },
                    { icon: <MapPin className="text-[#e23744]" />, title: "Smart Routing", desc: "Our AI helps you find the fastest routes to ensure high frequency." },
                    { icon: <ShieldCheck className="text-[#e23744]" />, title: "Health Cover", desc: "Comprehensive insurance coverage for all active fleet partners." }
                 ].map((perc, i) => (
                    <div key={i} className="flex gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0">
                            {perc.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">{perc.title}</h4>
                            <p className="text-xs text-white/60 font-medium leading-relaxed">{perc.desc}</p>
                        </div>
                    </div>
                 ))}
             </div>
        </div>

        {/* Right: Application Form */}
        <div className="flex-1 p-8 lg:p-24 flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 bg-gray-50 rounded-[2rem] mb-4">
                        <Bike size={32} className="text-[#e23744]" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900">Partner Registration</h3>
                    <p className="text-gray-400 text-sm font-bold mt-2">Become a part of the Yumm delivery family.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                        <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Rahul Sharma"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@email.com"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10 Digit Phone"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none font-bold text-sm shadow-sm"
                            />
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vehicle Selection</label>
                        <div className="relative">
                            <select
                                name="vehicle_type"
                                value={formData.vehicle_type}
                                onChange={handleChange}
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#e23744] transition-all outline-none appearance-none font-bold text-sm shadow-sm pr-12"
                            >
                                <option value="bike">Motorcycle (Fastest)</option>
                                <option value="scooter">Electric Scooter</option>
                                <option value="car">Car (Rain Preferred)</option>
                                <option value="bicycle">Bicycle (Eco Friendly)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                ▼
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-[#1c1c1c] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition shadow-xl mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Application →'}
                    </button>

                    <Link to="/login" className="block text-center text-[10px] text-[#e23744] font-black uppercase tracking-tight hover:underline">Already a partner? Login</Link>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryRegister;
