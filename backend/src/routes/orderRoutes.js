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

// Dashboard Analytics Routes (admin only)
router.get('/dashboard/stats', isAuthenticated, adminAuth, orderController.getDashboardStats);
router.get('/status/:status', isAuthenticated, adminAuth, orderController.getOrdersByStatus);

// Enhanced Analytics Routes (admin only)
router.get('/analytics/revenue', isAuthenticated, adminAuth, orderController.getRevenueAnalytics);
router.get('/analytics/products', isAuthenticated, adminAuth, orderController.getProductAnalytics);
router.get('/analytics/users', isAuthenticated, adminAuth, orderController.getUserAnalytics);
router.get('/analytics/profit', isAuthenticated, adminAuth, orderController.getProfitAnalytics);
router.get('/analytics/status', isAuthenticated, adminAuth, orderController.getOrderStatusAnalytics);
router.get('/analytics/geographic', isAuthenticated, adminAuth, orderController.getGeographicAnalytics);

// Order deletion route removed - financial data must be preserved

module.exports = router;    