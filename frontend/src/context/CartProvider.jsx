import React, { useState, useEffect, useMemo } from 'react';
import { CartContext } from './CartContext';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../hooks/useAuthentication';

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

    // Load cart from backend (works for both guests and logged-in users)
    const loadCart = async () => {
        console.log('🛒 CartProvider: Loading cart from backend...');
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await cartApi.getUserCart();
            console.log('🛒 CartProvider: Backend cart response:', response);
            
            if (response.success && response.data) {
                // Transform backend data to match frontend structure
                const items = response.data.items.map(item => ({
                    id: item.product_id,
                    cartItemId: item.cart_item_id,
                    name: item.product_name,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    img_url: item.image_urls ? JSON.parse(item.image_urls)[0] : null,
                    description: item.description,
                    stock_quantity: item.stock_quantity,
                    selected_size: item.selected_size,
                    selected_color: item.selected_color
                }));
                
                console.log('🛒 CartProvider: Transformed cart items:', items);
                setCartItems(items);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            console.error('🛒 CartProvider: Error loading cart from backend:', err);
            setError('Failed to load cart from server');
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart when authentication state changes
    useEffect(() => {
        console.log('🛒 CartProvider: Auth state changed:', { isAuthenticated, userId: user?.id });
        loadCart();
    }, [isAuthenticated, user?.id]);

    // Cart actions
    const addToCart = async (product, quantity = 1) => {
        console.log('🛒 CartProvider: Adding to cart:', { product, quantity });
        setIsLoading(true);
        setError(null);

        try {
            const response = await cartApi.addToCart(
                product.id, 
                quantity, 
                product.selected_size, 
                product.selected_color
            );
            
            if (response.success) {
                // Reload cart to get updated data
                await loadCart();
            } else {
                setError('Failed to add item to cart');
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Failed to add item to cart');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (cartItemId) => {
        console.log('🛒 CartProvider: Removing from cart:', cartItemId);
        setIsLoading(true);
        setError(null);

        try {
            const response = await cartApi.removeFromCart(cartItemId);
            
            if (response.success) {
                // Reload cart to get updated data
                await loadCart();
            } else {
                setError('Failed to remove item from cart');
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError('Failed to remove item from cart');
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        console.log('🛒 CartProvider: Updating quantity:', { cartItemId, quantity });
        
        if (quantity <= 0) {
            await removeFromCart(cartItemId);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await cartApi.updateQuantity(cartItemId, quantity);
            
            if (response.success) {
                // Reload cart to get updated data
                await loadCart();
            } else {
                setError('Failed to update item quantity');
            }
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update item quantity');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        console.log('🛒 CartProvider: Clearing cart');
        setIsLoading(true);
        setError(null);

        try {
            const response = await cartApi.clearCart();
            
            if (response.success) {
                setCartItems([]);
            } else {
                setError('Failed to clear cart');
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError('Failed to clear cart');
        } finally {
            setIsLoading(false);
        }
    };

    const isInCart = (productId, selectedSize = null, selectedColor = null) => {
        return cartItems.some(item => 
            item.id === productId && 
            item.selected_size === selectedSize &&
            item.selected_color === selectedColor
        );
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
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};