/**
 * Provider לעגלת קניות - CartProvider
 * 
 * Provider זה מספק גישה גלובלית לעגלת הקניות בכל האפליקציה.
 * מטפל בעגלה עבור משתמשים מאומתים (מהשרת) ואורחים (מ-localStorage).
 * 
 * API Calls:
 * - cartApi.getUserCart() - טעינת עגלה מהשרת (משתמשים מאומתים)
 * - cartApi.addToCart() - הוספת פריט לעגלה בשרת
 * - cartApi.updateQuantity() - עדכון כמות פריט בשרת
 * - cartApi.removeFromCart() - הסרת פריט מעגלה בשרת
 * - cartApi.clearCart() - ניקוי עגלה בשרת
 * 
 * תכונות:
 * - סנכרון אוטומטי בין localStorage לשרת בעת התחברות
 * - תמיכה באורחים (guest users) עם localStorage
 * - חסימת פעולות עגלה כאשר אדמין צופה בחנות
 * 
 * @param {ReactNode} children - רכיבי הילדים לעטיפה
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CartContext } from './CartContext';
import { cartApi } from '../services/cartApi';
import { useAuth } from '../hooks/useAuthentication';
import { useStoreView } from './AdminStoreViewContext';
import { 
    saveCartToStorage, 
    loadCartFromStorage, 
    clearCartFromStorage,
    generateCartItemId,
    validateCartItem,
    parseImageUrls
} from '../utils/cartUtils';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();
    const { isAdminViewingStore } = useStoreView();
    const prevAuthState = useRef({ isAuthenticated: false, userId: null });
    const hasSyncedGuestCart = useRef(false);
    const isLoadingCart = useRef(false);

    // Calculate cart totals
    const cartCount = useMemo(() => 
        cartItems.reduce((total, item) => total + item.quantity, 0), 
        [cartItems]
    );

    const cartTotal = useMemo(() => 
        cartItems.reduce((total, item) => total + (item.price * item.quantity), 0), 
        [cartItems]
    );

    /**
     * טוען עגלה מהשרת (משתמשים מאומתים) או מ-localStorage (אורחים)
     * 
     * API Call: cartApi.getUserCart() (רק למשתמשים מאומתים)
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. בודק אם המשתמש מאומת
     * 2. אם מאומת - טוען מהשרת וממיר את הנתונים לפורמט הפרונטאנד
     * 3. אם אורח - טוען מ-localStorage
     * 4. מעדכן את state עם הפריטים
     */
    const loadCart = async () => {
        // Prevent multiple simultaneous loads
        if (isLoadingCart.current) {
            console.log('🛒 CartProvider: Cart load already in progress, skipping');
            return;
        }
        
        console.log('🛒 CartProvider: Loading cart - auth state:', { isAuthenticated, userId: user?.id });
        isLoadingCart.current = true;
        setIsLoading(true);
        setError(null);
        
        try {
            if (isAuthenticated && user?.id) {
                // Logged-in user: load from backend
                console.log('🛒 CartProvider: Loading cart from backend for user:', user.id);
                try {
                    const response = await cartApi.getUserCart();
                    
                    if (response.success && response.data) {
                        // Transform backend data to match frontend structure
                        const items = response.data.items.map(item => {
                            try {
                                // Parse sizes if it's a string
                                let sizes = item.sizes;
                                if (typeof item.sizes === 'string') {
                                    try {
                                        sizes = JSON.parse(item.sizes);
                                    } catch (e) {
                                        sizes = [];
                                    }
                                }
                                
                                const transformedItem = {
                                    id: item.id,
                                    cartItemId: item.cartItemId,
                                    name: item.name,
                                    price: parseFloat(item.price),
                                    quantity: parseInt(item.quantity),
                                    img_url: parseImageUrls(item.images),
                                    description: item.description,
                                    stock_quantity: item.stock_quantity,
                                    selected_size: item.selected_size,
                                    sizes: sizes // Include sizes data for stock checking
                                };
                                return transformedItem;
                            } catch (itemError) {
                                console.error('🛒 CartProvider: Error processing cart item:', item, itemError);
                                return null;
                            }
                        }).filter(Boolean); // Remove any null items
                        
                        console.log('🛒 CartProvider: Loaded cart from backend:', items);
                        setCartItems(items);
                        
                        // Save to localStorage for consistency
                        saveCartToStorage(items);
                    } else {
                        console.log('🛒 CartProvider: No cart data from backend, setting empty cart');
                        setCartItems([]);
                    }
                } catch (apiError) {
                    console.error('🛒 CartProvider: Error loading cart from backend:', apiError);
                    // Check if it's an authentication error
                    if (apiError.response?.status === 401 || apiError.response?.status === 403) {
                        console.log('🛒 CartProvider: Auth error, falling back to localStorage');
                        // Treat as guest: load from localStorage
                        const items = loadCartFromStorage();
                        console.log('🛒 CartProvider: Loaded cart from localStorage as fallback:', items);
                        setCartItems(items);
                    } else {
                        // Other error: set error
                        setError('Failed to load cart');
                        setCartItems([]);
                    }
                }
            } else {
                // Guest user: load from localStorage
                console.log('🛒 CartProvider: Loading cart from localStorage for guest');
                const items = loadCartFromStorage();
                console.log('🛒 CartProvider: Loaded cart from localStorage:', items);
                setCartItems(items);
            }
        } catch (err) {
            console.error('🛒 CartProvider: Error loading cart:', err);
            setError('Failed to load cart');
            
            // Fallback to localStorage for guests
            if (!isAuthenticated) {
                const items = loadCartFromStorage();
                setCartItems(items);
            } else {
                setCartItems([]);
            }
        } finally {
            setIsLoading(false);
            isLoadingCart.current = false;
        }
    };

    /**
     * מסנכרן עגלת אורח לשרת כאשר משתמש מתחבר
     * 
     * API Calls:
     * - cartApi.getUserCart() - בודק אם יש פריטים קיימים בעגלה
     * - cartApi.addToCart() - מוסיף כל פריט מעגלת האורח
     * 
     * @returns {Promise<void>}
     * 
     * תהליך:
     * 1. בודק אם יש עגלת אורח ב-localStorage
     * 2. טוען את עגלת המשתמש המאומת מהשרת
     * 3. מוסיף כל פריט מעגלת האורח (אם לא קיים כבר)
     * 4. מנקה את עגלת האורח מ-localStorage
     */
    const syncGuestCartToBackend = async () => {
        if (!isAuthenticated || !user?.id || hasSyncedGuestCart.current) return;
        
        try {
            const guestCart = loadCartFromStorage();
            if (guestCart.length > 0) {
                console.log('🛒 CartProvider: Syncing guest cart to backend:', guestCart);
                
                // Mark as synced to prevent duplicate syncs
                hasSyncedGuestCart.current = true;
                
                // First, load the current logged-in user's cart to check for existing items
                const currentCartResponse = await cartApi.getUserCart();
                const currentCartItems = currentCartResponse.success ? currentCartResponse.data.items : [];
                
                console.log('🛒 CartProvider: Current logged-in cart items:', currentCartItems);
                
                // Add each guest cart item to backend, but check for duplicates first
                for (const guestItem of guestCart) {
                    if (validateCartItem(guestItem)) {
                        // Check if this item already exists in the logged-in cart
                        const existingItem = currentCartItems.find(item => 
                            item.id === guestItem.id && 
                            item.selected_size === guestItem.selected_size
                        );
                        
                        if (existingItem) {
                            console.log('🛒 CartProvider: Item already exists in logged-in cart, skipping sync for:', guestItem);
                            // Item already exists, skip adding it again to prevent quantity doubling
                            continue;
                        }
                        
                        console.log('🛒 CartProvider: Adding guest item to logged-in cart:', guestItem);
                        await cartApi.addToCart(guestItem.id, guestItem.quantity, guestItem.selected_size);
                    } else {
                        console.warn('🛒 CartProvider: Invalid cart item found:', guestItem);
                    }
                }
                
                // Clear guest cart from localStorage
                clearCartFromStorage();
                
                console.log('🛒 CartProvider: Guest cart synced successfully');
            }
        } catch (error) {
            console.error('🛒 CartProvider: Error syncing guest cart:', error);
            // Reset flag on error so it can be retried
            hasSyncedGuestCart.current = false;
        }
    };

    // Consolidated effect to handle all authentication and cart loading logic
    useEffect(() => {
        const wasAuthenticated = prevAuthState.current.isAuthenticated;
        const wasUserId = prevAuthState.current.userId;
        
        console.log('🛒 CartProvider: Auth state changed:', {
            wasAuthenticated,
            wasUserId,
            isAuthenticated,
            userId: user?.id
        });
        
        // User logged out
        if (wasAuthenticated && !isAuthenticated) {
            console.log('🛒 CartProvider: User logged out, clearing cart state');
            setCartItems([]);
            clearCartFromStorage();
            hasSyncedGuestCart.current = false; // Reset sync flag
        }
        // User logged in (first time or after logout)
        else if (!wasAuthenticated && isAuthenticated && user?.id) {
            console.log('🛒 CartProvider: User logged in, checking for guest cart sync');
            
            // Check if there's a guest cart to sync
            const guestCart = loadCartFromStorage();
            if (guestCart.length > 0 && !hasSyncedGuestCart.current) {
                console.log('🛒 CartProvider: Found guest cart, will sync');
                // Sync guest cart first, then load cart
                syncGuestCartToBackend().then(() => {
                    loadCart();
                });
            } else {
                console.log('🛒 CartProvider: No guest cart or already synced, loading cart directly');
                loadCart();
            }
        }
        // User ID changed (same user, different session)
        else if (wasAuthenticated && isAuthenticated && wasUserId !== user?.id) {
            console.log('🛒 CartProvider: User ID changed, loading cart');
            loadCart();
        }
        // Initial load or other auth state changes
        else if (!wasAuthenticated && !isAuthenticated) {
            console.log('🛒 CartProvider: Initial load as guest, loading cart');
            loadCart();
        }
        
        // Update previous state
        prevAuthState.current = { 
            isAuthenticated, 
            userId: user?.id 
        };
    }, [isAuthenticated, user?.id]);

    /**
     * מוסיף מוצר לעגלה
     * 
     * API Call: cartApi.addToCart() (רק למשתמשים מאומתים)
     * 
     * @param {Object} product - אובייקט המוצר להוספה
     * @param {number} quantity - כמות להוספה (ברירת מחדל: 1)
     * @returns {Promise<Object>} { success: boolean, message?: string }
     * 
     * תהליך:
     * 1. בודק אם אדמין צופה בחנות - חוסם פעולה
     * 2. בודק מלאי זמין
     * 3. אם מאומת - מוסיף לשרת
     * 4. אם אורח - מוסיף ל-localStorage
     * 5. מעדכן state
     */
    const addToCart = async (product, quantity = 1) => {
        // Block cart operations if admin is viewing store
        if (isAdminViewingStore) {
            console.log('🛒 CartProvider: Cart blocked - Admin viewing store');
            setError('You are in preview mode. Admins cannot add items to cart.');
            return { success: false, message: 'Admins cannot add items to cart in preview mode' };
        }

        console.log('🛒 CartProvider: Adding to cart:', { product, quantity });
        setIsLoading(true);
        setError(null);

        try {
            // Validate stock availability if provided
            if (product.available_stock !== undefined && quantity > product.available_stock) {
                setError(`Only ${product.available_stock} items available`);
                return { success: false, message: `Only ${product.available_stock} items available` };
            }

            if (isAuthenticated && user?.id) {
                // Logged-in user: add to backend
                console.log('🛒 CartProvider: Adding to backend for logged-in user');
                const response = await cartApi.addToCart(
                    product.id, 
                    quantity, 
                    product.selected_size
                );
                
                if (response.success) {
                    console.log('🛒 CartProvider: Backend add successful, reloading cart');
                    // Reload cart from backend to get updated state
                    await loadCart();
                    return { success: true };
                } else {
                    console.error('🛒 CartProvider: Backend add failed:', response);
                    setError(response.message || 'Failed to add item to cart');
                    return { success: false, message: response.message || 'Failed to add item to cart' };
                }
            } else {
                // Guest user: add to localStorage
                console.log('🛒 CartProvider: Adding to localStorage for guest user');
                const newItem = {
                    id: product.id,
                    cartItemId: generateCartItemId(),
                    name: product.name,
                    price: parseFloat(product.price),
                    quantity: quantity,
                    img_url: product.img_url || product.image_urls?.[0],
                    description: product.description,
                    stock_quantity: product.available_stock || product.stock_quantity,
                    selected_size: product.selected_size,
                    sizes: product.sizes // Include sizes for stock validation in cart
                };

                // Validate the new item
                if (!validateCartItem(newItem)) {
                    setError('Invalid product data');
                    return { success: false, message: 'Invalid product data' };
                }

                // Check if item already exists
                const existingItemIndex = cartItems.findIndex(item => 
                    item.id === product.id && item.selected_size === product.selected_size
                );

                if (existingItemIndex !== -1) {
                    // Check if adding would exceed stock
                    const existingItem = cartItems[existingItemIndex];
                    const newTotal = existingItem.quantity + quantity;
                    if (existingItem.stock_quantity && newTotal > existingItem.stock_quantity) {
                        setError(`Only ${existingItem.stock_quantity} items available for this size`);
                        return { success: false, message: `Only ${existingItem.stock_quantity} items available for this size` };
                    }
                    
                    // Update existing item quantity
                    const updatedItems = cartItems.map((item, index) => 
                        index === existingItemIndex 
                            ? { ...item, quantity: newTotal }
                            : item
                    );
                    setCartItems(updatedItems);
                    saveCartToStorage(updatedItems);
                } else {
                    // Add new item
                    const updatedItems = [...cartItems, newItem];
                    setCartItems(updatedItems);
                    saveCartToStorage(updatedItems);
                }
                
                return { success: true };
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            const errorMessage = err.message || 'Failed to add item to cart';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * מסיר פריט מעגלה
     * 
     * API Call: cartApi.removeFromCart(cartItemId) (רק למשתמשים מאומתים)
     * 
     * @param {number|string} cartItemId - ID של פריט העגלה להסרה
     * @returns {Promise<void>}
     */
    const removeFromCart = async (cartItemId) => {
        // Block cart operations if admin is viewing store
        if (isAdminViewingStore) {
            console.log('🛒 CartProvider: Cart blocked - Admin viewing store');
            setError('You are in preview mode. Admins cannot modify cart.');
            return;
        }

        console.log('🛒 CartProvider: Removing from cart:', cartItemId);
        setIsLoading(true);
        setError(null);

        try {
            if (isAuthenticated && user?.id) {
                // Logged-in user: remove from backend
                const response = await cartApi.removeFromCart(cartItemId);
                
                if (response.success) {
                    // Reload cart from backend
                    await loadCart();
                } else {
                    setError('Failed to remove item from cart');
                }
            } else {
                // Guest user: remove from localStorage
                const updatedItems = cartItems.filter(item => item.cartItemId !== cartItemId);
                setCartItems(updatedItems);
                saveCartToStorage(updatedItems);
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError('Failed to remove item from cart');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * מעדכן כמות פריט בעגלה
     * 
     * API Call: cartApi.updateQuantity(cartItemId, quantity) (רק למשתמשים מאומתים)
     * 
     * @param {number|string} cartItemId - ID של פריט העגלה
     * @param {number} quantity - כמות חדשה
     * @returns {Promise<void>}
     * 
     * הערה: אם כמות היא 0 או פחות, הפריט יוסר אוטומטית
     */
    const updateQuantity = async (cartItemId, quantity) => {
        // Block cart operations if admin is viewing store
        if (isAdminViewingStore) {
            console.log('🛒 CartProvider: Cart blocked - Admin viewing store');
            setError('You are in preview mode. Admins cannot modify cart.');
            return;
        }

        console.log('🛒 CartProvider: Updating quantity:', { cartItemId, quantity });
        
        if (quantity <= 0) {
            await removeFromCart(cartItemId);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isAuthenticated && user?.id) {
                // Logged-in user: update in backend
                console.log('🛒 CartProvider: Updating quantity in backend');
                const response = await cartApi.updateQuantity(cartItemId, quantity);
                
                if (response.success) {
                    console.log('🛒 CartProvider: Backend update successful, reloading cart');
                    // Reload cart from backend
                    await loadCart();
                } else {
                    console.error('🛒 CartProvider: Backend update failed:', response);
                    setError('Failed to update item quantity');
                }
            } else {
                // Guest user: update in localStorage
                console.log('🛒 CartProvider: Updating quantity in localStorage');
                const updatedItems = cartItems.map(item => 
                    item.cartItemId === cartItemId 
                        ? { ...item, quantity: quantity }
                        : item
                );
                setCartItems(updatedItems);
                saveCartToStorage(updatedItems);
                console.log('🛒 CartProvider: localStorage updated');
            }
        } catch (err) {
            console.error('🛒 CartProvider: Error updating quantity:', err);
            setError('Failed to update item quantity');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * מנקה את כל העגלה
     * 
     * API Call: cartApi.clearCart() (רק למשתמשים מאומתים)
     * 
     * @returns {Promise<void>}
     */
    const clearCart = async () => {
        // Block cart operations if admin is viewing store
        if (isAdminViewingStore) {
            console.log('🛒 CartProvider: Cart blocked - Admin viewing store');
            setError('You are in preview mode. Admins cannot modify cart.');
            return;
        }

        console.log('🛒 CartProvider: Clearing cart');
        setIsLoading(true);
        setError(null);

        try {
            if (isAuthenticated && user?.id) {
                // Logged-in user: clear backend cart
                const response = await cartApi.clearCart();
                
                if (response.success) {
                    setCartItems([]);
                    clearCartFromStorage();
                } else {
                    setError('Failed to clear cart');
                }
            } else {
                // Guest user: clear localStorage cart
                setCartItems([]);
                clearCartFromStorage();
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            setError('Failed to clear cart');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * בודק אם מוצר נמצא בעגלה
     * 
     * @param {number} productId - ID של המוצר
     * @param {string|null} selectedSize - גדל נבחר (אופציונלי)
     * @returns {boolean} true אם המוצר נמצא בעגלה
     */
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
        loadCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};