// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// Upload operations (admin only)
router.post('/product-images', 
  isAuthenticated, 
  adminAuth,
  upload.array('images', 10), // max 10 files
  uploadController.uploadProductImages
);

router.delete('/product-images/:productId', 
  isAuthenticated, 
  adminAuth,
  uploadController.deleteProductImage
);

module.exports = router;