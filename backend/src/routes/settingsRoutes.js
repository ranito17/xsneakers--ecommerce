// נתיבי הגדרות - מגדירים את הנתיבים לכל הפעולות הקשורות להגדרות
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { trackActivity, ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');

// נתיב הגדרות ציבוריות (ללא אימות נדרש)
router.get('/public', settingsController.getPublicSettings);

// פעולות הגדרות (אדמין בלבד)
router.get('/', isAuthenticated, adminAuth, settingsController.getSettings);
router.put('/', 
    isAuthenticated, 
    adminAuth, 
    trackActivity({
        action_type: ACTION_TYPES.SETTINGS_UPDATED,
        entity_type: ENTITY_TYPES.SETTINGS,
        description: 'System settings updated'
    }),
    settingsController.updateSettings
);

module.exports = router; 