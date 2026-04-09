const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypalController');
const isAuthenticated = require('../middleware/auth');

// יצירת הזמנת PayPal
router.post('/paypal/create-order', isAuthenticated, paypalController.createPayPalOrder);

// ביצוע תשלום PayPal ויצירת הזמנה
router.post('/paypal/capture-order', isAuthenticated, paypalController.capturePayPalOrder);

module.exports = router;

