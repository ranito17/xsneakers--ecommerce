const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/auth');

// All cart routes require authentication
router.use(isAuthenticated);

// Get user's cart
router.get('/cart/:userId', cartController.getUserCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update item quantity
router.put('/update/:cartItemId', cartController.updateQuantity);

// Remove item from cart
router.delete('/remove/:cartItemId', cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router;