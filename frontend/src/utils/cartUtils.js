// Cart utility functions for LocalStorage-based cart system

// Import utilities from other files
import { formatPrice as formatPriceUtil } from './price.utils';
import { getFirstImage } from './image.utils';

// LocalStorage keys
export const CART_STORAGE_KEY = 'shopping_cart';
export const CART_TIMESTAMP_KEY = 'cart_timestamp';

// Cart expiration time (30 days)
export const CART_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Save cart items to LocalStorage
 * @param {Array} items - Cart items to save
 */
export const saveCartToStorage = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        // Fallback: try to clear and save again
        try {
            localStorage.removeItem(CART_STORAGE_KEY);
            localStorage.removeItem(CART_TIMESTAMP_KEY);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
        } catch (fallbackError) {
            console.error('Fallback save also failed:', fallbackError);
        }
    }
};

/**
 * Load cart items from LocalStorage
 * @returns {Array} Cart items or empty array if none found
 */
export const loadCartFromStorage = () => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
        
        // Check if cart has expired
        if (timestamp && (Date.now() - parseInt(timestamp)) > CART_EXPIRATION_TIME) {
            console.log('🛒 Cart expired, clearing old cart data');
            clearCartFromStorage();
            return [];
        }
        
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
};

/**
 * Clear cart from LocalStorage
 */
export const clearCartFromStorage = () => {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_TIMESTAMP_KEY);
    } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
    }
};

/**
 * Check if cart is expired
 * @returns {boolean} True if cart is expired
 */
export const isCartExpired = () => {
    try {
        const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
        if (!timestamp) return false;
        
        return (Date.now() - parseInt(timestamp)) > CART_EXPIRATION_TIME;
    } catch (error) {
        console.error('Error checking cart expiration:', error);
        return false;
    }
};

/**
 * Get cart statistics
 * @param {Array} cartItems - Cart items array
 * @returns {Object} Cart statistics
 */
export const getCartStats = (cartItems) => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const uniqueItems = cartItems.length;
    
    return {
        itemCount,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        uniqueItems
    };
};

/**
 * Check if a product is already in cart
 * @param {Array} cartItems - Cart items array
 * @param {number} productId - Product ID to check
 * @param {string} selectedSize - Selected size (optional)
 * @returns {boolean} True if product is in cart
 */
export const isProductInCart = (cartItems, productId, selectedSize = null) => {
    return cartItems.some(item => 
        item.id === productId && 
        item.selected_size === selectedSize
    );
};

/**
 * Find cart item by product ID and size
 * @param {Array} cartItems - Cart items array
 * @param {number} productId - Product ID to find
 * @param {string} selectedSize - Selected size (optional)
 * @returns {Object|null} Cart item or null if not found
 */
export const findCartItem = (cartItems, productId, selectedSize = null) => {
    return cartItems.find(item => 
        item.id === productId && 
        item.selected_size === selectedSize
    );
};

/**
 * Generate unique cart item ID for guest users
 * @returns {string} Unique cart item ID
 */
export const generateCartItemId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate cart item data
 * @param {Object} item - Cart item to validate
 * @returns {boolean} True if item is valid
 */
export const validateCartItem = (item) => {
    return item && 
           typeof item.id === 'number' && 
           typeof item.quantity === 'number' && 
           item.quantity > 0 &&
           typeof item.price === 'number' && 
           item.price >= 0;
};

/**
 * Format price for display
 * Re-exported from price.utils.js (centralized location)
 */
export const formatPrice = (price, currency = 'USD') => formatPriceUtil(price, currency);

/**
 * Safely parse image URLs from backend data (kept for backward compatibility)
 * @param {string} imageUrls - Image URLs string (can be JSON array or simple string)
 * @returns {string|null} First image URL or null
 * @deprecated Use getFirstImage from image.utils.js instead
 */
export const parseImageUrls = (imageUrls) => {
    const firstImg = getFirstImage(imageUrls, null);
    return firstImg === '/placeholder-image.jpg' ? null : firstImg;
};

/**
 * Get cart storage info for debugging
 * @returns {Object} Cart storage information
 */
export const getCartStorageInfo = () => {
    try {
        const items = loadCartFromStorage();
        const timestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
        const stats = getCartStats(items);
        
        return {
            itemCount: stats.itemCount,
            uniqueItems: stats.uniqueItems,
            totalPrice: stats.totalPrice,
            timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : null,
            isExpired: isCartExpired(),
            storageSize: JSON.stringify(items).length
        };
    } catch (error) {
        console.error('Error getting cart storage info:', error);
        return null;
    }
};
