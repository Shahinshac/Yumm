import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerCart = () => {
  const navigate = useNavigate();
  // Mock cart items for initial view since user said "no sample data" in DB
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(localStorage.getItem('user_address') || 'Please set your delivery address');

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-200 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your Cart</h1>
            <p className="text-sm text-gray-500">Ready to place your order?</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100">
          <ShoppingCart size={16} />
          {items.length} items
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-8 bg-[#ff4b3a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e03d2e] transition shadow-lg shadow-red-100"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <button className="p-1 hover:bg-white rounded-md transition text-gray-600"><Minus size={14} /></button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button className="p-1 hover:bg-white rounded-md transition text-gray-600"><Plus size={14} /></button>
                </div>
                <button className="p-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-[#ff4b3a]" /> Bill Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Item Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Fee</span>
                  <span>₹5</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-xl font-black text-gray-900">₹{total + 45}</span>
                </div>
              </div>
              <button 
                id="checkout-btn"
                className="w-full mt-6 bg-[#ff4b3a] text-white py-4 rounded-2xl font-black hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                Place Order
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                <MapPin size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Delivery To</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {import.meta.env.VITE_USER_ADDRESS || 'Please set your delivery address'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;
