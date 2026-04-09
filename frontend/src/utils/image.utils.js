/**
 * Image Utilities
 * 
 * All image parsing, formatting, and validation functions.
 * Handles various image URL formats from backend (JSON, comma-separated strings, arrays).
 */

// ============================================================================
// IMAGE PARSING
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Parse image URLs from various formats (JSON string, comma-separated, array)
 * @param {string|Array} imageUrls - Image URLs in various formats
 * @returns {Array} Array of image URL strings
 */
export const parseImageUrls = (imageUrls) => {
    if (!imageUrls) return [];
    
    // Already an array
    if (Array.isArray(imageUrls)) {
        return imageUrls
            .map(v => (typeof v === 'string' ? v.trim() : v))
            .filter(Boolean);
    }
    
    // Try to parse as JSON
    if (typeof imageUrls === 'string') {
        try {
            const parsed = JSON.parse(imageUrls);
            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }
            // Single value parsed
            return parsed ? [parsed] : [];
        } catch (error) {
            // Not JSON, treat as comma-separated string
            return imageUrls
                .split(',')
                .map(url => url.trim())
                .filter(Boolean);
        }
    }
    
    return [];
};

/**
 * Get the first image URL with fallback
 * @param {string|Array} imageUrls - Image URLs in various formats
 * @param {string} fallback - Fallback image URL (default: '/placeholder-image.jpg')
 * @returns {string} First image URL or fallback
 */
export const getFirstImage = (imageUrls, fallback = '/placeholder-image.jpg') => {
    const images = parseImageUrls(imageUrls);
    return images.length > 0 ? images[0] : fallback;
};

/**
 * Get all image URLs
 * @param {string|Array} imageUrls - Image URLs in various formats
 * @returns {Array} Array of all image URLs
 */
export const getAllImages = (imageUrls) => {
    return parseImageUrls(imageUrls);
};

/**
 * Get the count of images
 * @param {string|Array} imageUrls - Image URLs in various formats
 * @returns {number} Number of images
 */
export const getImageCount = (imageUrls) => {
    return parseImageUrls(imageUrls).length;
};

/**
 * Get thumbnail (first image) for display
 * @param {string|Array} imageUrls - Image URLs in various formats
 * @param {string} fallback - Fallback image URL
 * @returns {string} Thumbnail image URL
 */
export const getThumbnail = (imageUrls, fallback = '/placeholder-image.jpg') => {
    return getFirstImage(imageUrls, fallback);
};

// ============================================================================
// PRODUCT IMAGE HELPERS
// ============================================================================

/**
 * Get product image with smart fallback chain
 * Tries: image_urls[0] → image_url → img_url → fallback
 * @param {Object} product - Product object with various image fields
 * @param {string} fallback - Fallback image URL
 * @returns {string} Product image URL
 */
export const getProductImage = (product, fallback = '/placeholder-image.jpg') => {
    if (!product) return fallback;

    if (product.image_urls) {
        const firstImage = getFirstImage(product.image_urls);
        if (firstImage !== '/placeholder-image.jpg') {
            return getAbsoluteImageUrl(firstImage);
        }
    }

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return getAbsoluteImageUrl(product.images[0]);
    }

    if (product.image_url) {
        return getAbsoluteImageUrl(product.image_url);
    }

    if (product.img_url) {
        return getAbsoluteImageUrl(product.img_url);
    }

    return fallback;
};
/**
 * Get all product images with fallback
 * @param {Object} product - Product object
 * @returns {Array} Array of image URLs
 */
export const getProductImages = (product) => {
    if (!product) return [];

    if (product.image_urls) {
        const images = parseImageUrls(product.image_urls);
        if (images.length > 0) {
            // IMPORTANT: don't pass getAbsoluteImageUrl directly to map,
            // because Array.map passes (value, index) and "index" would be
            // interpreted as baseUrl.
            return images.map((img) => getAbsoluteImageUrl(img));
        }
    }

    if (product.images && Array.isArray(product.images)) {
        return product.images.map((img) => getAbsoluteImageUrl(img));
    }

    if (product.image_url) {
        return [getAbsoluteImageUrl(product.image_url)];
    }

    if (product.img_url) {
        return [getAbsoluteImageUrl(product.img_url)];
    }

    return [];
};

/**
 * Get product image count
 * @param {Object} product - Product object
 * @returns {number} Number of product images
 */
export const getProductImageCount = (product) => {
    return getProductImages(product).length;
};

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

/**
 * Validate if a string is a valid image URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL
 */
export const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Check for common image extensions
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
    
    // Check if it's a URL or data URL
    const isUrl = /^(https?:\/\/|\/)/i.test(url) || url.startsWith('data:image');
    
    return isUrl && (imageExtensions.test(url) || url.startsWith('data:image'));
};

/**
 * Validate if an array contains valid image URLs
 * @param {Array} images - Array of image URLs
 * @returns {boolean} True if all URLs are valid
 */
export const isValidImageArray = (images) => {
    if (!Array.isArray(images)) return false;
    if (images.length === 0) return false;
    
    return images.every(img => isValidImageUrl(img));
};

/**
 * Filter out invalid image URLs from an array
 * @param {Array} images - Array of image URLs
 * @returns {Array} Filtered array with only valid URLs
 */
export const filterValidImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.filter(img => isValidImageUrl(img));
};

// ============================================================================
// IMAGE URL TRANSFORMATION
// ============================================================================

/**
 * Convert image URL to thumbnail URL (if CDN supports it)
 * For now, returns the original URL
 * @param {string} imageUrl - Original image URL
 * @param {number} width - Desired width (default: 200)
 * @returns {string} Thumbnail URL
 */
export const getImageThumbnailUrl = (imageUrl, width = 200) => {
    if (!imageUrl) return '/placeholder-image.jpg';

    return getAbsoluteImageUrl(imageUrl);
};

/**
 * Convert relative image URL to absolute
 * @param {string} imageUrl - Relative or absolute URL
 * @param {string} baseUrl - Base URL (default: current origin)
 * @returns {string} Absolute URL
 */
export const getAbsoluteImageUrl = (imageUrl, baseUrl = API_BASE_URL) => {
    if (!imageUrl) return '/placeholder-image.jpg';

    // Normalize baseUrl:
    // - many apps set REACT_APP_API_URL like "https://domain.com/api"
    // - uploads live at "/uploads", not "/api/uploads"
    const normalizedBaseUrl = String(baseUrl || '')
        .replace(/\/+$/, '')
        .replace(/\/api$/i, '');

    // Already absolute
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Data URL
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    // Relative URL from backend uploads
    if (imageUrl.startsWith('/')) {
        return `${normalizedBaseUrl}${imageUrl}`;
    }

    return `${normalizedBaseUrl}/${imageUrl}`;
};

// ============================================================================
// DATA TRANSFORMATION (Frontend ↔ Backend)
// ============================================================================

/**
 * Prepare image URLs for backend submission
 * Converts array to JSON string
 * @param {Array} images - Array of image URLs
 * @returns {string} JSON string of images
 */
export const prepareImagesForBackend = (images) => {
    if (!Array.isArray(images)) return '[]';
    
    const validImages = filterValidImages(images);
    return JSON.stringify(validImages);
};

/**
 * Parse image URLs received from backend
 * Ensures consistent array format
 * @param {string|Array} backendImages - Images from backend
 * @returns {Array} Array of image URLs
 */
export const parseImagesFromBackend = (backendImages) => {
    return parseImageUrls(backendImages);
};

