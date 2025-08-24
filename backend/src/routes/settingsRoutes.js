const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Public settings route (no authentication required)
router.get('/public', settingsController.getPublicSettings);

// Settings operations (admin only)
router.get('/', isAuthenticated, adminAuth, settingsController.getSettings);
router.put('/', isAuthenticated, adminAuth, settingsController.updateSettings);

module.exports = router; 