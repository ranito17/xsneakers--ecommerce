// נתיבי הקטגוריות - מגדירים את הנתיבים לכל הפעולות הקשורות לקטגוריות
// מתחברים לבקר הקטגוריות לביצוע הפעולות
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { categoryUpload } = require('../middleware/upload');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { trackActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');

// קבלת כל הקטגוריות - GET /categoryRoutes/ (public)
router.get('/', categoryController.getCategories);

// הוספת קטגוריה חדשה - POST /categoryRoutes/ (admin only)
router.post('/', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.CATEGORY_CREATED,
        entity_type: ENTITY_TYPES.CATEGORY,
        description: 'New category created'
    }),
    categoryController.addCategory
);

// עדכון קטגוריה - PUT /categoryRoutes/:id (admin only)
router.put('/:id', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.CATEGORY_UPDATED,
        entity_type: ENTITY_TYPES.CATEGORY,
        description: 'Category updated'
    }),
    categoryController.updateCategory
);

// השבתת קטגוריה - PATCH /categoryRoutes/:id/deactivate (admin only)
router.patch('/:id/deactivate', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.CATEGORY_UPDATED,
        entity_type: ENTITY_TYPES.CATEGORY,
        description: 'Category deactivated #{id}'
    }),
    categoryController.deactivateCategory
);

// הפעלת קטגוריה - PATCH /categoryRoutes/:id/activate (admin only)
router.patch('/:id/activate', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.CATEGORY_UPDATED,
        entity_type: ENTITY_TYPES.CATEGORY,
        description: 'Category activated #{id}'
    }),
    categoryController.activateCategory
);

// העלאת תמונה לקטגוריה - POST /categoryRoutes/upload (admin only)
router.post('/upload', isAuthenticated, adminAuth, categoryUpload.single('image'), categoryController.uploadCategoryImage);

// מחיקת תמונת קטגוריה - DELETE /categoryRoutes/:categoryId/image (admin only)
router.delete('/:categoryId/image', isAuthenticated, adminAuth, categoryController.deleteCategoryImage);

module.exports = router;