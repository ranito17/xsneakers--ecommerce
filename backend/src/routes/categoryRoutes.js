// נתיבי הקטגוריות - מגדירים את הנתיבים לכל הפעולות הקשורות לקטגוריות
// מתחברים לבקר הקטגוריות לביצוע הפעולות
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// קבלת כל הקטגוריות - GET /categoryRoutes/ (public)
router.get('/', categoryController.getCategories);

// הוספת קטגוריה חדשה - POST /categoryRoutes/ (admin only)
router.post('/', isAuthenticated, adminAuth, categoryController.addCategory);

// מחיקת קטגוריה - DELETE /categoryRoutes/:id (admin only)
router.delete('/:id', isAuthenticated, adminAuth, categoryController.deleteCategory);

module.exports = router;