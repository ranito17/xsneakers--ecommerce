const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { trackActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');
const { orderLimiter } = require('../middleware/rateLimiter');
// Customer actions
router.post(
    '/place',
   
    isAuthenticated,
    orderLimiter,
    trackActivity({
        action_type: ACTION_TYPES.ORDER_PLACED,
        entity_type: ENTITY_TYPES.ORDER,
        description: 'New order placed #{id}'
    }),
    orderController.placeOrder
);

router.get('/my-orders', isAuthenticated, orderController.getMyOrders);
router.get('/my-orders/count', isAuthenticated, orderController.getMyOrderCount);

router.get('/:id/items', isAuthenticated, orderController.getOrderItems);
router.get('/:id/receipt', isAuthenticated, orderController.generateOrderReceiptPDF);
router.get('/:id', isAuthenticated, orderController.getOrderById);

// Admin actions
router.get('/', isAuthenticated, adminAuth, orderController.getAllOrders);

router.patch(
    '/:id/status',
    isAuthenticated,
    adminAuth,
    trackActivity({
        action_type: ACTION_TYPES.ORDER_STATUS_CHANGED,
        entity_type: ENTITY_TYPES.ORDER,
        description: 'Order #{id} status changed'
    }),
    orderController.updateOrderStatus
);

router.get('/status/:status', isAuthenticated, adminAuth, orderController.getOrdersByStatus);

// Admin analytics
router.get('/analytics/revenue', isAuthenticated, adminAuth, orderController.getRevenueAnalytics);
router.get('/analytics/products', isAuthenticated, adminAuth, orderController.getProductAnalytics);
router.get('/analytics/order-status', isAuthenticated, adminAuth, orderController.getOrderStatusAnalytics);
router.get('/analytics/users', isAuthenticated, adminAuth, orderController.getUserAnalytics);
router.get('/analytics/product/:productId/sizes', isAuthenticated, adminAuth, orderController.getProductSizeAnalytics);
router.get('/admin/user/:userId/count', isAuthenticated, adminAuth, orderController.getUserOrderCountByAdmin);

// Public
router.get('/analytics/best-sellers', orderController.getBestSellers);

module.exports = router;