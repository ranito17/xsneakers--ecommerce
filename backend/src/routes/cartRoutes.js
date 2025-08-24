const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Cart routes work for both guests and logged-in users
// Authentication is handled automatically by the cart service

// Get user's cart (works for both guests and logged-in users)
router.get('/cart', cartController.getUserCart);

// Add item to cart (works for both guests and logged-in users)
router.post('/add', cartController.addToCart);

// Update item quantity (works for both guests and logged-in users)
router.put('/update/:cartItemId', cartController.updateQuantity);

// Remove item from cart (works for both guests and logged-in users)
router.delete('/remove/:cartItemId', cartController.removeFromCart);

// Clear entire cart (works for both guests and logged-in users)
router.delete('/clear', cartController.clearCart);

module.exports = router;