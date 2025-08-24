const cartService = require('../services/cartService');

// Get user's cart with all items (works for both guests and logged-in users)
const getUserCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error('Controller error in getUserCart:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Add item to cart (from product page) - works for both guests and logged-in users
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, selected_size, selected_color } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const result = await cartService.addToCart(req, productId, quantity, selected_size, selected_color);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Controller error in addToCart:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Update item quantity (from cart page) - works for both guests and logged-in users
const updateQuantity = async (req, res) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const result = await cartService.updateQuantity(req, cartItemId, quantity);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Controller error in updateQuantity:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Remove item from cart - works for both guests and logged-in users
const removeFromCart = async (req, res) => {
    try {
        const { cartItemId } = req.params;

        const result = await cartService.removeFromCart(req, cartItemId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Controller error in removeFromCart:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Clear entire cart - works for both guests and logged-in users
const clearCart = async (req, res) => {
    try {
        const result = await cartService.clearCart(req);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('Controller error in clearCart:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

module.exports = {
    getUserCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
};