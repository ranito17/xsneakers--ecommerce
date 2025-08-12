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

    // Local Storage Cart Management
    const CART_STORAGE_KEY = 'shopping_cart';
    const SESSION_CART_KEY = 'session_cart';

    const getLocalCart = () => {
        try {
            const localCart = localStorage.getItem(CART_STORAGE_KEY);
            const sessionCart = sessionStorage.getItem(SESSION_CART_KEY);
            
            // Prioritize session storage (more recent), fallback to localStorage
            if (sessionCart) {
                return JSON.parse(sessionCart);
            } else if (localCart) {
                return JSON.parse(localCart);
            }
            return [];
        } catch (error) {
            console.error('Error reading cart from storage:', error);
            return [];
        }
    };

    const saveLocalCart = (items) => {
        try {
            const cartData = JSON.stringify(items);
            localStorage.setItem(CART_STORAGE_KEY, cartData);
            sessionStorage.setItem(SESSION_CART_KEY, cartData);
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    };

    const clearLocalCart = () => {
        try {
            localStorage.removeItem(CART_STORAGE_KEY);
            sessionStorage.removeItem(SESSION_CART_KEY);
        } catch (error) {
            console.error('Error clearing cart from storage:', error);
        }
    };

    // Load cart from backend for authenticated users
    const loadCartFromBackend = async () => {
        if (!user?.id) {
            console.log('🛒 CartProvider: No user ID, skipping backend cart load');
            return;
        }
        
        console.log('🛒 CartProvider: Loading cart from backend for user:', user.id);
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await cartApi.getUserCart(user.id);
            console.log('🛒 CartProvider: Backend cart response:', response);
            
            if (response.success && response.data) {
                // Transform backend data to match frontend structure
                const backendItems = response.data.items.map(item => ({
                    id: item.product_id,
                    cartItemId: item.cart_item_id,
                    name: item.product_name,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    img_url: item.img_url,
                    description: item.description,
                    stock_quantity: item.stock_quantity,
                    selected_size: item.selected_size
                }));

                // Merge with local cart if exists
                const localItems = getLocalCart();
                const mergedItems = mergeCarts(backendItems, localItems);
                
                console.log('🛒 CartProvider: Merged cart items:', mergedItems);
                setCartItems(mergedItems);
                
                // Save merged cart to backend
                await syncCartToBackend(mergedItems);
                
                // Clear local cart after successful merge
                clearLocalCart();
            }
        } catch (err) {
            console.error('🛒 CartProvider: Error loading cart from backend:', err);
            setError('Failed to load cart from server');
        } finally {
            setIsLoading(false);
        }
    };

    // Merge local and backend carts intelligently
    const mergeCarts = (backendItems, localItems) => {
        const merged = [...backendItems];
        
        localItems.forEach(localItem => {
            const existingItem = merged.find(item => 
                item.id === localItem.id && 
                item.selected_size === localItem.selected_size
            );
            
            if (existingItem) {
                // Add quantities if same product with same size
                existingItem.quantity += localItem.quantity;
            } else {
                // Add as new item
                merged.push(localItem);
            }
        });
        
        return merged;
    };

    // Sync cart to backend for authenticated users
    const syncCartToBackend = async (items) => {
        if (!user?.id) return;
        
        try {
            // Clear existing cart
            await cartApi.clearCart(user.id);
            
            // Add all items
            for (const item of items) {
                await cartApi.addToCart(
                    user.id, 
                    item.id, 
                    item.quantity, 
                    item.selected_size
                );
            }
        } catch (error) {
            console.error('Error syncing cart to backend:', error);
        }
    };

    // Load cart when user changes
    useEffect(() => {
        console.log('🛒 CartProvider: User changed:', { userId: user?.id, isAuthenticated });
        
        if (isAuthenticated && user?.id) {
            console.log('🛒 CartProvider: User authenticated, loading from backend...');
            loadCartFromBackend();
        } else {
            console.log('🛒 CartProvider: Guest user, loading from local storage...');
            const localItems = getLocalCart();
            setCartItems(localItems);
            setError(null);
        }
    }, [user?.id, isAuthenticated]);

    // Save cart to appropriate storage when cart changes
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            // For authenticated users, save to backend
            syncCartToBackend(cartItems);
        } else {
            // For guest users, save to local storage
            saveLocalCart(cartItems);
        }
    }, [cartItems, isAuthenticated, user?.id]);

    // Cart actions
    const addToCart = async (product, quantity = 1) => {
        setIsLoading(true);
        setError(null);

        try {
            const newItem = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: quantity,
                img_url: product.img_url,
                description: product.description,
                stock_quantity: product.stock_quantity,
                selected_size: product.selected_size
            };

            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => 
                    item.id === newItem.id && 
                    item.selected_size === newItem.selected_size
                );

                if (existingItem) {
                    // Update quantity if same product with same size
                    return prevItems.map(item => 
                        item.id === existingItem.id && 
                        item.selected_size === existingItem.selected_size
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    // Add new item
                    return [...prevItems, newItem];
                }
            });
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError('Failed to add item to cart');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (productId, selectedSize = null) => {
        setIsLoading(true);
        setError(null);

        try {
            setCartItems(prevItems => 
                prevItems.filter(item => 
                    !(item.id === productId && 
                      item.selected_size === selectedSize)
                )
            );
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError('Failed to remove item from cart');
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity, selectedSize = null) => {
        if (quantity <= 0) {
            await removeFromCart(productId, selectedSize);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.id === productId && 
                    item.selected_size === selectedSize
                        ? { ...item, quantity }
                        : item
                )
            );
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError('Failed to update item quantity');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        setIsLoading(true);
        setError(null);

        try {
            setCartItems([]);
            clearLocalCart();
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError('Failed to clear cart');
        } finally {
            setIsLoading(false);
        }
    };

    const isInCart = (productId, selectedSize = null) => {
        return cartItems.some(item => 
            item.id === productId && 
            item.selected_size === selectedSize
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
        loadCartFromBackend
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};