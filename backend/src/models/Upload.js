// models/Upload.js
const dbSingleton = require('../config/database');
const { normalizeImageUrls, imageUrlsToString, stripToPathname } = require('../utils/image');
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
      const existingUrls = normalizeImageUrls(rows[0].image_urls, 'products');
const newUrls = normalizeImageUrls(imageUrls, 'products');
const allUrls = [...existingUrls, ...newUrls];
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

      
      
      // Helper function to normalize URLs for comparison
      const currentUrls = normalizeImageUrls(rows[0].image_urls, 'products');

const targetUrl = stripToPathname(imageUrl);
const normalizedTarget = targetUrl.startsWith('/uploads/')
    ? targetUrl
    : `/uploads/products/${targetUrl.replace(/^\/+/, '')}`;

const updatedUrls = currentUrls.filter(url => url !== normalizedTarget);

      // Update with remaining URLs
      const query = 'UPDATE products SET image_urls = ? WHERE id = ?';
      const updatedUrlsString = imageUrlsToString(updatedUrls, 'products');

      await db.query(query, [updatedUrlsString, productId]);
    } catch (error) {
      console.error('Error in removeProductImage:', error);
      throw error;
    }
  }

  static async getProductImages(productId) {
    try {
      const db = await dbSingleton.getConnection();
  
      const [rows] = await db.query(
        'SELECT image_urls FROM products WHERE id = ?',
        [productId]
      );
  
      if (rows.length === 0) {
        return [];
      }
  
      return normalizeImageUrls(rows[0].image_urls, 'products');
    } catch (error) {
      console.error('Error in getProductImages:', error);
      throw error;
    }
  }

  static async removeAllProductImages(productId) {
    const db = await dbSingleton.getConnection();
    
    try {
      const query = 'UPDATE products SET image_urls = NULL WHERE id = ?';
      await db.query(query, [productId]);
    } catch (error) {
      console.error('Error in removeAllProductImages:', error);
      throw error;
    }
  }
}

module.exports = Upload;