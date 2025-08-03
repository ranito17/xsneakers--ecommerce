import { createContext } from 'react';

export const CartContext = createContext({
    // Cart state
    cartItems: [],
    cartCount: 0,
    cartTotal: 0,
    
    // Cart actions
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    isInCart: () => {},
    
    // Loading states
    isLoading: false,
    error: null
});