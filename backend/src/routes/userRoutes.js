// נתיבי המשתמשים - מגדירים את הנתיבים לכל הפעולות הקשורות למשתמשים
// מתחברים לבקר המשתמשים לביצוע הפעולות
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuthenticated = require('../middleware/auth');
const {adminAuth} = require('../middleware/adminAuth');


// התחברות משתמש - POST /userRoutes/login
router.post('/login', userController.login);
router.get('/me', isAuthenticated, userController.me);
router.post('/logout', userController.logout);
// יצירת משתמש חדש - POST /userRoutes/signup
router.post('/signup', userController.createUser);

// Password reset routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/verify-reset-token/:token', userController.verifyResetToken);

// Admin routes - get all users
router.get('/all', isAuthenticated, adminAuth, userController.getAllUsers);

module.exports = router;