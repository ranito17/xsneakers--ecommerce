const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Customer operations (authenticated users)
router.post('/place', isAuthenticated, orderController.placeOrder);
router.get('/user/:userId', isAuthenticated, orderController.getUserOrders);
router.get('/:id/items', isAuthenticated, orderController.getOrderItems);
// Admin operations (admin only)
router.get('/', isAuthenticated, adminAuth, orderController.getAllOrders);
router.get('/:id', isAuthenticated, orderController.getOrderById);
router.put('/:id', isAuthenticated, adminAuth, orderController.updateOrder);
router.patch('/:id/status', isAuthenticated, adminAuth, orderController.updateOrderStatus);
router.delete('/:id', isAuthenticated, adminAuth, orderController.deleteOrder);


module.exports = router;    