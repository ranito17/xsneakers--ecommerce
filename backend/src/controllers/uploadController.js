// בקר ההעלאות - מנהל את כל הפעולות הקשורות להעלאת קבצים
// מתחבר למודל Upload לביצוע פעולות בסיס הנתונים
const Upload = require('../models/Upload');
const fs = require('fs').promises;
const path = require('path');

// העלאת תמונות מוצר למסד הנתונים
// השליטה מקבלת קבצים מהלקוח ושולחת אותם למודל
const uploadProductImages = async (req, res) => {
  try {
    const { productId } = req.body;
    const files = req.files; // multer provides this

        // Save file paths to database with full URL
        const imageUrls = files.map(file => `/uploads/products/${file.filename}`);
    
    // Update product with new image URLs
    await Upload.updateProductImages(productId, imageUrls);

    res.json({
      success: true,
      imageUrls: imageUrls,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images'
        });
    }
};

// מחיקת תמונת מוצר ממסד הנתונים
// השליטה מקבלת מזהה מוצר וכתובת תמונה ושולחת אותם למודל למחיקה
const deleteProductImage = async (req, res) => {
    try {
        const { productId } = req.params;
        const { imageUrl } = req.body;

        // Delete the file from disk
        const filePath = path.join('uploads', 'products', imageUrl);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.warn('File not found for deletion:', filePath);
        }

        // Remove from database
        await Upload.removeProductImage(productId, imageUrl);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
            message: 'Failed to delete image'
    });
  }
};

module.exports = {
    uploadProductImages,
    deleteProductImage
};