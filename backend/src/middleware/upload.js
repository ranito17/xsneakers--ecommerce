// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const productsDir = path.join(__dirname, '..', 'uploads', 'products');
const categoryDir = path.join(__dirname, '..', 'uploads', 'category');

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}
if (!fs.existsSync(categoryDir)) {
  fs.mkdirSync(categoryDir, { recursive: true });
}

// Storage for products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage for categories
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoryDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  // Check file mimetype
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'), false);
  }
};

// Product upload
const productUpload = multer({ 
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Category upload (single file only)
const categoryUpload = multer({ 
  storage: categoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Maximum 1 file for categories
  }
});

module.exports = {
  productUpload,
  categoryUpload
};