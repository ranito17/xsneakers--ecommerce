// נתיבי העלאה - מגדירים את הנתיבים לכל הפעולות הקשורות להעלאת קבצים
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const isAuthenticated = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const { productUpload } = require('../middleware/upload');
const multer = require('multer');

// middleware לטיפול בשגיאות multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// פעולות העלאה (אדמין בלבד)
router.post('/product-images', 
  isAuthenticated, 
  adminAuth,
  productUpload.array('images', 10), // מקסימום 10 קבצים
  handleUploadError,
  uploadController.uploadProductImages
);

router.delete('/product-images/:productId', 
  isAuthenticated, 
  adminAuth,
  uploadController.deleteProductImage
);

router.delete('/product-images/:productId/all', 
  isAuthenticated, 
  adminAuth,
  uploadController.deleteAllProductImages
);

module.exports = router;