const Cart = require('../models/Cart');

// Get user's cart with all items
const getUserCart = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.user_id;
        const cart = await Cart.getUserCart(userId);
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

// Add item to cart (from product page)
const addToCart = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.user_id;
        const { productId, quantity = 1, selected_size, selected_color } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        const result = await Cart.addToCart(userId, productId, quantity, selected_size, selected_color);
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

// Update item quantity (from cart page)
const updateQuantity = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.user_id;
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const result = await Cart.updateQuantity(userId, cartItemId, quantity);
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

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.user_id;
        const { cartItemId } = req.params;

        const result = await Cart.removeFromCart(userId, cartItemId);
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

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.user_id;

        const result = await Cart.clearCart(userId);
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