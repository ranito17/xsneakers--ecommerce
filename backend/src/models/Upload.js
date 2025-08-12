// models/Upload.js
const dbSingleton = require('../config/database');

class Upload {
  static async updateProductImages(productId, imageUrls) {
    const db = await dbSingleton.getConnection();
    
    try {
      // First get current image_urls to append new ones
      const [rows] = await db.query(
        'SELECT image_urls FROM products WHERE id = ?',
        [productId]
      );

      if (rows.length === 0) {
        throw new Error('Product not found');
      }

      // Combine existing and new image URLs
      const existingUrls = rows[0].image_urls ? rows[0].image_urls.split(',') : [];
      const allUrls = [...existingUrls, ...imageUrls];
      const imageUrlsString = allUrls.join(',');
      
    const query = 'UPDATE products SET image_urls = ? WHERE id = ?';
      await db.query(query, [imageUrlsString, productId]);
    } catch (error) {
      console.error('Error in updateProductImages:', error);
      throw error;
    }
  }

  static async removeProductImage(productId, imageUrl) {
    const db = await dbSingleton.getConnection();
    
    try {
      // First get current image_urls
      const [rows] = await db.query(
        'SELECT image_urls FROM products WHERE id = ?',
        [productId]
      );

      if (rows.length === 0) {
        throw new Error('Product not found');
      }

      const currentUrls = rows[0].image_urls ? rows[0].image_urls.split(',') : [];
      
      // Helper function to normalize URLs for comparison
      const normalizeUrl = (url) => {
        let normalized = url.trim();
        // Remove base URL if present
        if (normalized.includes('http://localhost:3001/uploads/products/')) {
          normalized = normalized.replace('http://localhost:3001/uploads/products/', '');
        } else if (normalized.startsWith('/uploads/products/')) {
          normalized = normalized.replace('/uploads/products/', '');
        }
        return normalized;
      };

      const targetUrl = normalizeUrl(imageUrl);
      const updatedUrls = currentUrls.filter(url => normalizeUrl(url) !== targetUrl);

      console.log('🗑️ Database update:', { 
        originalUrls: currentUrls, 
        targetUrl: imageUrl, 
        normalizedTarget: targetUrl,
        remainingUrls: updatedUrls 
      });

      // Update with remaining URLs
      const query = 'UPDATE products SET image_urls = ? WHERE id = ?';
      const updatedUrlsString = updatedUrls.join(',');
    
      await db.query(query, [updatedUrlsString, productId]);
      console.log('✅ Database updated successfully');
    } catch (error) {
      console.error('Error in removeProductImage:', error);
      throw error;
    }
  }
}

module.exports = Upload;