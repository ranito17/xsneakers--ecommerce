// נתיבי המוצרים - מגדירים את הנתיבים לכל הפעולות הקשורות למוצרים
// מתחברים לבקר המוצרים לביצוע הפעולות
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { trackActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');

// קבלת כל המוצרים - GET /api/products (public)
router.get('/', productController.getProducts);

// נתיבי אנליטיקס לדשבורד (אדמין בלבד) - חייב להיות לפני /:id
router.get('/dashboard/low-stock', isAuthenticated, adminAuth, productController.getLowStockProducts);
router.get('/dashboard/low-stock-sizes', isAuthenticated, adminAuth, productController.getProductsWithLowStockSizes);
router.get('/dashboard/stats', isAuthenticated, adminAuth, productController.getProductStats);
router.get('/dashboard/top-products', isAuthenticated, adminAuth, productController.getTopProducts);

// קבלת מלאי זמין לגדל ספציפי - GET /api/products/:productId/stock/:size (ציבורי) - חייב להיות לפני /:id
router.get('/:productId/stock/:size', productController.getStockForSize);

// קבלת מוצר לפי מזהה - GET /api/products/:id (public) - חייב להיות אחרי כל הנתיבים הספציפיים
router.get('/:id', productController.getProductById);

// יצירת מוצר חדש - POST /api/products (admin only)
router.post('/', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.PRODUCT_CREATED,
        entity_type: ENTITY_TYPES.PRODUCT,
        description: 'New product created'
    }),
    productController.createProduct
);

// עדכון מוצר - PUT /api/products/:id (admin only)
router.put('/:id', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.PRODUCT_UPDATED,
        entity_type: ENTITY_TYPES.PRODUCT,
        description: 'Product updated'
    }),
    productController.updateProduct
);
    
// עדכון כל הגדלים של מוצר בבת אחת (אדמין בלבד)
router.put('/:productId/sizes', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.STOCK_CHANGED,
        entity_type: ENTITY_TYPES.PRODUCT,
        description: 'Product sizes updated #{id}'
    }),
    productController.updateProductSizes
);

module.exports = router;