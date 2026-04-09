// נתיבי ספק - מגדירים את הנתיבים לפעולות הקשורות לספק
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// POST /api/supplier/refuel - שליחת אימייל מילוי מלאי לספק (אדמין בלבד)
router.post('/refuel', isAuthenticated, adminAuth, supplierController.sendStockRefuelEmail);

module.exports = router;
