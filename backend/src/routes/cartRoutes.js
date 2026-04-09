// נתיבי עגלה - מגדירים את הנתיבים לכל הפעולות הקשורות לעגלת קניות
// כל פעולות העגלה דורשות אימות (אורחים משתמשים ב-LocalStorage)
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// קבלת עגלת משתמש (רק משתמשים מחוברים)
router.get('/cart', isAuthenticated, cartController.getUserCart);

// הוספת פריט לעגלה (רק משתמשים מחוברים)
router.post('/add', isAuthenticated, cartController.addToCart);

// עדכון כמות פריט (רק משתמשים מחוברים)
router.put('/update/:cartItemId', isAuthenticated, cartController.updateQuantity);

// הסרת פריט מעגלה (רק משתמשים מחוברים)
router.delete('/remove/:cartItemId', isAuthenticated, cartController.removeFromCart);

// ניקוי עגלה מלאה (רק משתמשים מחוברים)
router.delete('/clear', isAuthenticated, cartController.clearCart);

// אדמין: קבלת עגלת משתמש ספציפי
router.get('/admin/user/:userId', isAuthenticated, adminAuth, cartController.getUserCartByAdmin);

module.exports = router;