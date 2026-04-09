const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// נתיבי אנליטיקס - כל הנתיבים דורשים אימות אדמין

// אנליטיקס פיננסי (הכנסות)
router.get('/finance', isAuthenticated, adminAuth, analyticsController.getFinanceAnalytics);

// אנליטיקס משתמשים
router.get('/users', isAuthenticated, adminAuth, analyticsController.getUserAnalytics);
router.get('/users/list', isAuthenticated, adminAuth, analyticsController.getUserListAnalytics);

// אנליטיקס מוצרים (כולל קטגוריות)
router.get('/products', isAuthenticated, adminAuth, analyticsController.getProductAnalytics);

// אנליטיקס הזמנות (סטטוס ומילוי)
router.get('/orders', isAuthenticated, adminAuth, analyticsController.getOrderAnalytics);

// אנליטיקס עגלות (נטישה והמרה)
router.get('/cart', isAuthenticated, adminAuth, analyticsController.getCartAnalytics);

// אנליטיקס מפושט/משולב (לתאימות לאחור)
router.get('/simplified', isAuthenticated, adminAuth, analyticsController.getSimplifiedAnalytics);

module.exports = router;

