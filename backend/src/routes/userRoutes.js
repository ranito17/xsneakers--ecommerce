// נתיבי המשתמשים - מגדירים את הנתיבים לכל הפעולות הקשורות למשתמשים
// מתחברים לבקר המשתמשים לביצוע הפעולות
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');
const {adminAuth} = require('../middleware/adminAuth');
const { trackActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');
const { authLimiter } = require('../middleware/rateLimiter');

// התחברות משתמש - POST /userRoutes/login

router.post('/login', authLimiter, userController.login);
router.get('/me', isAuthenticated, userController.me);
router.post('/logout', authLimiter, userController.logout);
// יצירת משתמש חדש - POST /userRoutes/signup
router.post('/signup', authLimiter,
    trackActivity({
        action_type: ACTION_TYPES.USER_CREATED,
        entity_type: ENTITY_TYPES.USER,
        description: 'New user account created'
    }),
    userController.createUser
);

// נתיבי איפוס סיסמה
router.post('/forgot-password', authLimiter, userController.forgotPassword);
router.post('/reset-password', authLimiter, userController.resetPassword);

// נתיבי אדמין - קבלת כל המשתמשים
router.get('/all', isAuthenticated, adminAuth, userController.getAllUsers);

// נתיבי פרופיל
router.get('/profile', isAuthenticated, userController.getProfile);
router.put('/profile', isAuthenticated, userController.updateProfile);
router.put('/address', isAuthenticated, userController.updateAddress);
router.put('/change-password', isAuthenticated, userController.changePassword);

// נתיבי רשימת משאלות
router.get('/wishlist', isAuthenticated, userController.getWishlist);
router.post('/wishlist', isAuthenticated, userController.addToWishlist);
router.delete('/wishlist/:productId', isAuthenticated, userController.removeFromWishlist);

module.exports = router;