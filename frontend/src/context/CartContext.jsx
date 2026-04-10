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
          items: prev.items.map(i => {
            if (i.id === item.id) {
               const currentQty = i.quantity || i.qty || 0;
               return { ...i, quantity: currentQty + 1, qty: currentQty + 1 };
            }
            return i;
          })
        };
      }

      const q = item.quantity || item.qty || 1;
      return {
        ...prev,
        items: [...prev.items, { ...item, quantity: q, qty: q }],
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updatedItems = prev.items.map(i => {
        if (i.id === itemId) {
          const currentQty = i.quantity || i.qty || 1;
          const nextQty = Math.max(0, currentQty - 1);
          return { ...i, quantity: nextQty, qty: nextQty };
        }
        return i;
      }).filter(i => (i.quantity || i.qty) > 0);

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
    const item = cart.items.find(i => i.id === itemId);
    return item ? (item.quantity || item.qty || 0) : 0;
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
        const q = item.quantity || item.qty || 0;
        return total + (item.price * q);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getItemQuantity, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
