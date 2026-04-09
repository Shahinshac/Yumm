import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, ArrowLeft, Loader2, Plus, Minus, ShoppingBag, Utensils, Tag } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { useCart } from '../../context/CartContext';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, getItemQuantity, getCartTotal } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await customerService.getRestaurantDetails(id);
        setRestaurant(data.restaurant);
        setMenu(data.menu || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff4b3a] mb-4" />
        <p className="text-gray-500 font-medium tracking-tight">Loading deliciousness...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Utensils size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">{error || 'Restaurant not found'}</h2>
        <button 
          onClick={() => navigate('/home')}
          className="mt-6 text-[#ff4b3a] font-bold flex items-center gap-2 mx-auto hover:underline"
        >
          <ArrowLeft size={18} /> Back to all restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header / Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-3xl mb-8 group">
        <img 
          src={`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80&sig=${restaurant.id}`} 
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <button 
          onClick={() => navigate('/home')}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-2xl transition-all border border-white/30 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg flex items-center gap-1 text-gray-800 text-[10px] font-black shadow-sm">
                <Star size={10} className="text-yellow-500 fill-yellow-500" />
                {restaurant.rating || '4.5'}
             </div>
          </div>
          <h1 className="text-4xl font-black mb-2 drop-shadow-md">{restaurant.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
             <div className="flex items-center gap-1.5"><MapPin size={16} className="text-orange-500" /> {restaurant.address}</div>
             <div className="flex items-center gap-1.5"><Clock size={16} className="text-orange-500" /> {restaurant.delivery_time || 30} mins Delivery</div>
             <div className="flex items-center gap-1.5"><TrendingUp size={16} className="text-orange-500" /> ₹{restaurant.min_order || 149} min order</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-2">
        {/* Menu Items */}
        <div className="lg:col-span-3 space-y-8">
            {/* Active Special Offer */}
            {restaurant?.offer_active && restaurant?.special_offer && (
              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-8 flex items-center gap-4 animate-pulse">
                <div className="p-3 bg-white rounded-2xl text-[#ff4b3a] shadow-md border border-orange-50">
                  <Tag size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest leading-none">Restaurant Offer</h4>
                  <p className="text-base font-black text-[#ff4b3a] mt-1.5">{restaurant.special_offer}</p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-black text-gray-900 border-b-4 border-[#ff4b3a] inline-block pb-1">Recommended Menu</h2>
            
            {menu.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 italic text-gray-400 font-medium">
                    No menu items listed yet for this restaurant.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menu.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                                <img 
                                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'} 
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {item.is_veg === false && (
                                    <div className="absolute top-1 left-1 bg-red-500 rounded-sm p-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                                {item.is_veg === true && (
                                    <div className="absolute top-1 left-1 bg-green-500 rounded-sm p-0.5">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2">{item.description || 'Delightfully fresh and delicious.'}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-gray-900">₹{item.price}</span>
                                    
                                    {getItemQuantity(item.id) > 0 ? (
                                        <div className="flex items-center gap-3 bg-[#ff4b3a] text-white p-1 rounded-xl shadow-lg shadow-red-100">
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-1 hover:bg-white/20 rounded-lg transition"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-black text-xs w-4 text-center">{getItemQuantity(item.id)}</span>
                                            <button 
                                                onClick={() => addToCart(item, restaurant)}
                                                className="p-1 hover:bg-white/20 rounded-lg transition"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => addToCart(item, restaurant)}
                                            className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-black transition active:scale-95 shadow-sm"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Floating Cart Sidebar */}
        <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden shadow-gray-200/50">
                <div className="bg-gray-900 p-6 text-white">
                    <h3 className="font-black text-lg flex items-center gap-2">
                        <ShoppingBag size={20} className="text-[#ff4b3a]" /> Cart
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                        {cart.items.length > 0 ? `From ${cart.restaurantName}` : 'Your cart is empty'}
                    </p>
                </div>

                <div className="p-6">
                    {cart.items.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="text-gray-300" size={24} />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Add items to start your meal</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-6 scrollbar-hide">
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="font-bold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-500">₹{item.price} × {item.quantity}</p>
                                        </div>
                                        <span className="font-black text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6 text-xs text-gray-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-bold text-gray-700">₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span className="font-bold text-gray-700">₹40</span>
                                </div>
                                <div className="flex justify-between text-gray-900 text-base font-black pt-2">
                                    <span>Total</span>
                                    <span className="text-[#ff4b3a]">₹{getCartTotal() + 40}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/cart')}
                                className="w-full bg-[#ff4b3a] text-white py-4 rounded-2xl font-black hover:bg-[#e03d2e] transition shadow-lg shadow-red-100 active:scale-95 flex items-center justify-center gap-2"
                            >
                                Continue to Cart
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ size, className }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
);

export default RestaurantDetails;
