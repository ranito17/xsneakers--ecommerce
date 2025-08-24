const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

/**
 * POST /api/supplier/refuel
 * Send stock refuel email to supplier (admin only)
 */
router.post('/refuel', isAuthenticated, adminAuth, supplierController.sendStockRefuelEmail);

/**
 * GET /api/supplier/fulfill/:token
 * Handle supplier fulfillment confirmation (public endpoint)
 */
router.get('/fulfill/:token', supplierController.handleFulfillment);

/**
 * GET /api/supplier/status/:token
 * Get fulfillment status (admin only)
 */
router.get('/status/:token', isAuthenticated, adminAuth, supplierController.getFulfillmentStatus);

module.exports = router;
