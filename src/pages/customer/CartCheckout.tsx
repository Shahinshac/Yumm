import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import MobileNav from '../../components/MobileNav';

export default function CartCheckout() {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, clearCart, placeOrder } = useApp();
  const [address] = useState('4521 Luxury Lane, Suite 400');
  const [placing, setPlacing] = useState(false);

  const delivery = 4.99;
  const service = 2.50;
  const grandTotal = cartTotal + delivery + service;
  const restaurantId = cart[0]?.menuItem ? 'r1' : '';

  const handleOrder = () => {
    if (!cart.length) return;
    setPlacing(true);
    const order = placeOrder(restaurantId, address);
    setTimeout(() => {
      navigate(`/customer/track/${order.id}`);
    }, 600);
  };

  if (!cart.length) return (
    <div className="mobile-frame flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="font-lexend font-bold text-2xl">Your cart is empty</h2>
      <p className="text-on-surface-variant mt-2">Add items from a restaurant to get started</p>
      <button onClick={() => navigate('/customer')} className="btn-primary mt-6">Browse Restaurants</button>
    </div>
  );

  return (
    <div className="mobile-frame bg-surface min-h-screen pb-10">
      <header className="pt-14 px-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="glass-1 w-11 h-11 rounded-2xl flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-lexend font-bold text-2xl">Your Cart</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Delivery address */}
        <div className="glass-1 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Delivery Address</p>
            <p className="font-semibold text-on-surface mt-0.5">{address}</p>
          </div>
        </div>

        {/* Cart items */}
        <div className="space-y-3">
          {cart.map(({ menuItem, quantity }) => (
            <div key={menuItem.id} className="glass-1 rounded-2xl p-4 flex gap-3 items-center">
              <img src={menuItem.imageUrl} alt={menuItem.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface truncate">{menuItem.name}</p>
                <p className="text-primary font-bold font-lexend text-base mt-1">${(menuItem.price * quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{quantity}×</span>
                <button onClick={() => removeFromCart(menuItem.id)}
                  className="w-7 h-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill details */}
        <div className="glass-1 rounded-2xl p-5 space-y-3">
          <h3 className="font-lexend font-bold text-lg">Bill Details</h3>
          <div className="flex justify-between text-on-surface-variant">
            <span>Item Total</span><span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Delivery Fee</span><span>${delivery.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Service Fee</span><span>${service.toFixed(2)}</span>
          </div>
          <div className="border-t border-outline-variant pt-3 flex justify-between items-center">
            <span className="font-lexend font-bold text-xl">Total</span>
            <span className="font-lexend font-bold text-2xl text-primary">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Place order */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-6 bg-surface/80 backdrop-blur-md">
        <button onClick={handleOrder} disabled={placing}
          className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-lexend font-bold text-lg shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-colors disabled:opacity-60">
          {placing ? 'Placing Order...' : `Place Order • $${grandTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
