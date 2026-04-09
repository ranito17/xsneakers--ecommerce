// נתיבי פעילות - מגדירים נתיבים למעקב פעילות
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// כל נתיבי הפעילות דורשים אימות אדמין
router.use(isAuthenticated, adminAuth);

// GET /api/activityRoutes - קבלת כל הפעילויות עם סינון
router.get('/', activityController.getActivities);

// GET /api/activityRoutes/statistics - קבלת סטטיסטיקות פעילות
router.get('/statistics', activityController.getStatistics);



// DELETE /api/activityRoutes/old - מחיקת פעילויות ישנות מ-90 יום (ברירת מחדל)
router.delete('/old', activityController.deleteOldActivities);

module.exports = router;

