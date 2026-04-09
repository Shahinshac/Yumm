import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('yumm_cart');
    return saved ? JSON.parse(saved) : { items: [], restaurantId: null, restaurantName: '' };
  });

  useEffect(() => {
    localStorage.setItem('yumm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, restaurant) => {
    setCart(prev => {
      // If adding from a different restaurant, clear previous cart
      if (prev.restaurantId && prev.restaurantId !== restaurant.id) {
        if (!window.confirm("Your cart contains items from another restaurant. Clear cart and add this instead?")) {
            return prev;
        }
        return {
            items: [{ ...item, quantity: 1 }],
            restaurantId: restaurant.id,
            restaurantName: restaurant.name
        };
      }

      const existing = prev.items.find(i => i.id === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        };
      }

      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: 1 }],
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updatedItems = prev.items.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0);

      return {
        ...prev,
        items: updatedItems,
        restaurantId: updatedItems.length === 0 ? null : prev.restaurantId,
        restaurantName: updatedItems.length === 0 ? '' : prev.restaurantName
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], restaurantId: null, restaurantName: '' });
  };

  const getItemQuantity = (itemId) => {
    return cart.items.find(i => i.id === itemId)?.quantity || 0;
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getItemQuantity, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
