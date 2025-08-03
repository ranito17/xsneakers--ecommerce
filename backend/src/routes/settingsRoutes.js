const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Settings operations (admin only)
router.get('/', isAuthenticated, adminAuth, settingsController.getSettings);
router.put('/', isAuthenticated, adminAuth, settingsController.updateSettings);

module.exports = router; 