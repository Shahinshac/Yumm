import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { customerService } from '../../services/customerService';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const platformFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + platformFee;

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    if (!deliveryAddress.trim()) {
      setShowAddressModal(true);
      return;
    }
    setLoading(true);
    try {
        const orderData = {
            restaurant_id: cart.restaurantId,
            items: cart.items.map(i => ({
                id: i.id,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                qty: i.quantity  // send both for backend compatibility
            })),
            total_amount: total,
            delivery_address: deliveryAddress,
            payment_method: "COD"
        };
        
        const res = await customerService.placeOrder(orderData);
        setPlacedOrder(res.order);
        clearCart();
        
        setTimeout(() => {
            navigate(`/orders/${res.order.id}/track`);
        }, 2000);

    } catch (err) {
        alert("Failed to place order: " + (err.response?.data?.error || err.message));
    } finally {
        setLoading(false);
    }
  };

  if (placedOrder) {
      return (
          <div className="max-w-xl mx-auto py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 animate-bounce">
                  <CheckCircle size={60} />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Order Placed!</h1>
              <p className="text-gray-500 font-medium">Your order #{placedOrder.id.slice(-6).toUpperCase()} has been received. Redirecting to tracking...</p>
              <div className="pt-4">
                  <Loader2 className="animate-spin mx-auto text-[#ff4b3a]" size={30} />
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 px-4">
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
            <p className="text-sm text-gray-500">Ready to place your order {cart.restaurantName ? `from ${cart.restaurantName}` : ''}?</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          <ShoppingCart size={16} />
          {cart.items.reduce((a, b) => a + b.quantity, 0)} items
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/home')}
            className="mt-8 bg-[#ff4b3a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 active:scale-95"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition group">
                <img 
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'} 
                    alt={item.name} 
                    className="w-20 h-20 rounded-xl object-cover" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 font-black">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-inner">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 active:scale-90"
                  >
                        <Minus size={14} />
                  </button>
                  <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item, { id: cart.restaurantId, name: cart.restaurantName })}
                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 active:scale-90"
                  >
                        <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
                onClick={clearCart}
                className="w-full py-4 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-500 transition"
            >
                Clear entire cart
            </button>
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-[#ff4b3a]" /> Bill Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-4">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₹{total}</span>
                </div>
              </div>
              <button 
                disabled={loading}
                onClick={handlePlaceOrder}
                className="w-full mt-8 bg-[#ff4b3a] text-white py-4 rounded-2xl font-black hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                Place Order
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-orange-50 rounded-xl shrink-0">
                <MapPin size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Address</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {deliveryAddress || <span className="text-gray-400 italic font-normal">No address selected</span>}
                </p>
                <button 
                  onClick={() => { setAddressInput(deliveryAddress); setShowAddressModal(true); }}
                  className="text-[10px] font-black text-orange-600 uppercase mt-2 hover:underline"
                >
                  {deliveryAddress ? 'Change Address' : '+ Add Address'}
                </button>
              </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900">Delivery Address</h3>
                    <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <textarea
                    value={addressInput}
                    onChange={e => setAddressInput(e.target.value)}
                    placeholder="Enter your full delivery address (house no, street, landmark, city)..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#ff4b3a] focus:bg-white outline-none transition-all resize-none"
                    rows={4}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddressModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                    >Cancel</button>
                    <button
                      onClick={() => { 
                        if (addressInput.trim()) {
                          setDeliveryAddress(addressInput.trim());
                          setShowAddressModal(false);
                        }
                      }}
                      className="flex-1 py-3 bg-[#ff4b3a] text-white font-bold rounded-xl hover:bg-red-600 transition"
                    >Save Address</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCart;
