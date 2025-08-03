import React, { useState, useEffect, useMemo } from 'react';
import { CartContext } from './CartContext';
import { cartApi } from '../services/cartApi';
import { useAuth } from './useAuth';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();

    // Calculate cart totals
    const cartCount = useMemo(() => 
        cartItems.reduce((total, item) => total + item.quantity, 0), 
        [cartItems]
    );

    const cartTotal = useMemo(() => 
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0), 
        [cartItems]
    );

    // Load cart from backend when user is authenticated
    const loadCartFromBackend = async () => {
        if (!isAuthenticated || !user?.id) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await cartApi.getUserCart(user.id);
            if (response.success && response.data) {
                // Transform backend data to match frontend structure
                const items = response.data.items.map(item => ({
                    id: item.product_id, // Backend returns product_id, frontend expects id
                    cartItemId: item.cart_item_id,
                    name: item.product_name,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    img_url: item.img_url,
                    description: item.description,
                    stock_quantity: item.stock_quantity,
                    selected_color: item.selected_color,
                    selected_size: item.selected_size
                }));
                setCartItems(items);
            }
        } catch (err) {
            console.error('Error loading cart from backend:', err);
            setError('Failed to load cart from server');
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart when authentication status changes
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            // User is authenticated - load from backend
            loadCartFromBackend();
        } else {
            // User is guest - clear cart (no localStorage)
            setCartItems([]);
            setError(null);
        }
    }, [isAuthenticated, user?.id]);

    // Cart actions - no authentication check, just save to DB if user exists
    const addToCart = async (product, quantity = 1) => {
        if (isAuthenticated && user?.id) {
            // User exists - save to database
            setIsLoading(true);
            setError(null);

            try {
                const response = await cartApi.addToCart(user.id, product.id, quantity, product.selected_size, product.selected_color);
                if (response.success) {
                    // Reload cart from backend to get updated data
                    await loadCartFromBackend();
                }
            } catch (err) {
                console.error('Error adding to cart:', err);
                setError('Failed to add item to cart');
            } finally {
                setIsLoading(false);
            }
        } else {
            // No user - just add to local state (no localStorage)
            setCartItems(prev => {
                const existingItem = prev.find(item => item.id === product.id);
                
                if (existingItem) {
                    return prev.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                
                return [...prev, { ...product, quantity }];
            });
        }
    };

    const removeFromCart = async (productId) => {
        if (isAuthenticated && user?.id) {
            // User exists - remove from database
            const cartItem = cartItems.find(item => item.id === productId);
            if (!cartItem) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await cartApi.removeFromCart(user.id, cartItem.cartItemId);
                if (response.success) {
                    await loadCartFromBackend();
                }
            } catch (err) {
                console.error('Error removing from cart:', err);
                setError('Failed to remove item from cart');
            } finally {
                setIsLoading(false);
            }
        } else {
            // No user - just remove from local state
            setCartItems(prev => prev.filter(item => item.id !== productId));
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        if (isAuthenticated && user?.id) {
            // User exists - update in database
            const cartItem = cartItems.find(item => item.id === productId);
            if (!cartItem) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await cartApi.updateQuantity(user.id, cartItem.cartItemId, quantity);
                if (response.success) {
                    await loadCartFromBackend();
                }
            } catch (err) {
                console.error('Error updating quantity:', err);
                setError('Failed to update item quantity');
            } finally {
                setIsLoading(false);
            }
        } else {
            // No user - just update local state
            setCartItems(prev =>
                prev.map(item =>
                    item.id === productId
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated && user?.id) {
            // User exists - clear from database
            setIsLoading(true);
            setError(null);

            try {
                const response = await cartApi.clearCart(user.id);
                if (response.success) {
                    setCartItems([]);
                }
            } catch (err) {
                console.error('Error clearing cart:', err);
                setError('Failed to clear cart');
            } finally {
                setIsLoading(false);
            }
        } else {
            // No user - just clear local state
            setCartItems([]);
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        isLoading,
        error,
        loadCartFromBackend // Expose this for manual refresh
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};