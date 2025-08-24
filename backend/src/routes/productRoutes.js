// נתיבי המוצרים - מגדירים את הנתיבים לכל הפעולות הקשורות למוצרים
// מתחברים לבקר המוצרים לביצוע הפעולות
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// קבלת כל המוצרים - GET /productRoutes/ (public)
router.get('/', productController.getProducts);

// קבלת מוצר לפי מזהה - GET /productRoutes/:id (public)
router.get('/:id', productController.getProductById);

// יצירת מוצר חדש - POST /productRoutes/ (admin only)
router.post('/', isAuthenticated, adminAuth, productController.createProduct);

// עדכון מוצר - PUT /productRoutes/:id (admin only)
router.put('/:id', isAuthenticated, adminAuth, productController.updateProduct);
    
// מחיקת מוצר - DELETE /productRoutes/:id (admin only)
router.delete('/:id', isAuthenticated, adminAuth, productController.deleteProduct);

// Dashboard Analytics Routes (admin only)
router.get('/dashboard/low-stock', isAuthenticated, adminAuth, productController.getLowStockProducts);
router.get('/dashboard/stats', isAuthenticated, adminAuth, productController.getProductStats);

module.exports = router;