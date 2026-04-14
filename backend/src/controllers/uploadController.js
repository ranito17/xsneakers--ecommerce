// בקר ההעלאות - מנהל את כל הפעולות הקשורות להעלאת קבצים
// מתחבר למודל Upload לביצוע פעולות בסיס הנתונים
const Upload = require('../models/Upload');
const fs = require('fs').promises;
const path = require('path');
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

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

        // Extract filename from the full URL
        let filename;
        if (imageUrl.startsWith('/uploads/products/')) {
            // Relative URL format: /uploads/products/filename.png
            filename = imageUrl.replace('/uploads/products/', '');
        } else {
            // Assume it's already just the filename
            try {
                filename = new URL(imageUrl).pathname.replace('/uploads/products/', '');
            } catch {
                filename = imageUrl;
            }
        }

        // Delete the file from disk
        const filePath = path.join(UPLOADS_ROOT, 'products', filename);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.warn('⚠️ File not found for deletion:', filePath);
            // Continue with database update even if file doesn't exist
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

// Delete all images for a product
const deleteAllProductImages = async (req, res) => {
    try {
        const { productId } = req.params;

        // Get current product images from database
        const currentImages = await Upload.getProductImages(productId);
        
        if (currentImages && currentImages.length > 0) {
            // Delete all files from disk
            for (const imageUrl of currentImages) {
                let filename;
                if (imageUrl.startsWith('/uploads/products/')) {
                    filename = imageUrl.replace('/uploads/products/', '');
                } else {
                    try {
                        filename = new URL(imageUrl).pathname.replace('/uploads/products/', '');
                    } catch {
                        filename = imageUrl;
                    }
                }

                const filePath = path.join(UPLOADS_ROOT, 'products', filename);
                try {
                    await fs.unlink(filePath);
                } catch (fileError) {
                    console.warn('⚠️ File not found for deletion:', filePath);
                }
            }
        }

        // Remove all images from database
        await Upload.removeAllProductImages(productId);

        res.json({
            success: true,
            message: 'All images deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting all images:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete all images'
        });
    }
};

module.exports = {
    uploadProductImages,
    deleteProductImage,
    deleteAllProductImages
};