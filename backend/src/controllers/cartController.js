const Cart = require('../models/Cart');
const { normalizeString, toPositiveInt, toInt } = require('../validation/commonValidator');

// קבלת עגלת משתמש עם כל הפריטים (רק משתמשים מחוברים)
const getUserCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const cart = await Cart.getUserCart(req.user.id);
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

// הוספת פריט לעגלה (רק משתמשים מחוברים)
const addToCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const productId = toPositiveInt(req.body?.productId);
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { productId: 'productId must be a positive integer' }
            });
        }

        const quantityRaw = req.body?.quantity === undefined ? 1 : req.body.quantity;
        const quantity = toInt(quantityRaw);
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { quantity: 'quantity must be an integer >= 1' }
            });
        }

        const selected_size = req.body?.selected_size === undefined || req.body?.selected_size === null
            ? undefined
            : normalizeString(req.body.selected_size);
        if (selected_size !== undefined && !selected_size) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { selected_size: 'selected_size must be a non-empty string' }
            });
        }

        const result = await Cart.addToCart(req.user.id, productId, quantity, selected_size);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error('🛒 Controller: ERROR in addToCart controller:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// עדכון כמות פריט (רק משתמשים מחוברים)
const updateQuantity = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const cartItemId = toPositiveInt(req.params.cartItemId);
        if (!cartItemId) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { cartItemId: 'cartItemId must be a positive integer' }
            });
        }

        const quantity = toInt(req.body?.quantity);
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { quantity: 'quantity must be an integer >= 1' }
            });
        }

        const result = await Cart.updateQuantity(req.user.id, cartItemId, quantity);
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

// הסרת פריט מעגלה (רק משתמשים מחוברים)
const removeFromCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const cartItemId = toPositiveInt(req.params.cartItemId);
        if (!cartItemId) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: { cartItemId: 'cartItemId must be a positive integer' }
            });
        }

        const result = await Cart.removeFromCart(req.user.id, cartItemId);
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

// ניקוי עגלה מלאה (רק משתמשים מחוברים)
const clearCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        const result = await Cart.clearCart(req.user.id);
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

// קבלת עגלת משתמש ספציפי (אדמין בלבד)
const getUserCartByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
        const cart = await Cart.getUserCart(userId);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (err) {
        console.error('Controller error in getUserCartByAdmin:', err);
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
    clearCart,
    getUserCartByAdmin
};