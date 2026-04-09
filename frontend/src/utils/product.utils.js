/**
 * כלי עזר למוצרים - Product Utilities
 * 
 * כל הפונקציות הקשורות לעיצוב, ולידציה והמרת נתונים של מוצרים.
 * קובץ זה מרכז את כל פעולות המוצרים כדי לשמור על שלמות נתונים בין
 * הפרונטאנדאקאנד.
 */

// ייבוא פונקציית עיצוב מחיר מ-price.utils.js (מקור יחיד)
import { formatPrice } from './price.utils';

// ============================================================================
// חישובי מלאי - STOCK CALCULATIONS
// ============================================================================

/**
 * מחשב את סך המלאי ממערך הגדלים
 * מטפל גם בפורמט הישן (מערך של מחרוזות/מספרים) וגם בפורמט החדש (מערך של אובייקטים עם quantity)
 * 
 * @param {Array|string} sizes - נתוני גדלים (יכול להיות מחרוזת JSON או מערך)
 * @param {number} fallbackStock - מלאי גיבוי אם לגדלים אין כמויות (ברירת מחדל: 0)
 * @returns {number} סך כמות המלאי
 */
export const calculateTotalStock = (sizes, fallbackStock = 0) => {
    try {
        let sizesArray = sizes;
        
        // Parse string to array if needed
        if (typeof sizes === 'string') {
            try {
                sizesArray = JSON.parse(sizes);
            } catch (e) {
                // If parsing fails, return fallback
                return fallbackStock;
            }
        }
        
        // Not an array, return fallback
        if (!Array.isArray(sizesArray) || sizesArray.length === 0) {
            return fallbackStock;
        }
        
        // Check if it's the new format with quantities
        if (typeof sizesArray[0] === 'object' && sizesArray[0].hasOwnProperty('quantity')) {
            // New format: sum all quantities
            return sizesArray.reduce((total, sizeObj) => {
                const qty = parseInt(sizeObj.quantity) || 0;
                return total + qty;
            }, 0);
        }
        
        // Old format (just size numbers/strings) - return fallback
        return fallbackStock;
    } catch (error) {
        console.error('Error calculating total stock:', error);
        return fallbackStock;
    }
};

/**
 * בודק אם נתוני הגדלים תואמים לסך המלאי
 * 
 * @param {Array} sizes - מערך של אובייקטי גדלים עם כמויות
 * @param {number} totalStock - סך כמות המלאי
 * @returns {boolean} true אם סכום הגדלים תואם לסך המלאי
 */
export const validateStockConsistency = (sizes, totalStock) => {
    const calculatedStock = calculateTotalStock(sizes, 0);
    return calculatedStock === totalStock;
};

// ============================================================================
// SIZE FORMATTING & PARSING
// ============================================================================

/**
 * Parse sizes data from various formats into a standardized array
 * @param {Array|string} sizes - Product sizes data
 * @returns {Array} Standardized array of size objects or numbers
 */
const parseSizesData = (sizes) => {
    if (!sizes) return [];
    
    // If it's already an array
    if (Array.isArray(sizes)) {
        return sizes;
    }
    
    // If it's a string, try to parse it
    if (typeof sizes === 'string') {
        try {
            const parsed = JSON.parse(sizes);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            // Handle comma-separated string
            return sizes.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    
    return [];
};

/**
 * Check if sizes data is in the new size-quantity object format
 * @param {Array} sizesArray - Parsed sizes array
 * @returns {boolean} True if it's the new format
 */
const isSizeQuantityFormat = (sizesArray) => {
    return sizesArray.length > 0 && 
           typeof sizesArray[0] === 'object' && 
           sizesArray[0].size !== undefined;
};

/**
 * Format sizes for admin display with quantities
 * @param {Array|string} sizes - Product sizes data
 * @returns {string} Formatted string for admin view (e.g., "Size 7: 5 units, Size 8: 3 units")
 */
export const formatSizesForAdmin = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (sizesArray.length === 0) return 'N/A';
    
    if (isSizeQuantityFormat(sizesArray)) {
        // New format: size-quantity objects - display as "Size 7: 5 units"
        return sizesArray.map(sizeObj => `Size ${sizeObj.size}: ${sizeObj.quantity} units`).join(', ');
    } else {
        // Legacy format: array of numbers/strings
        return sizesArray.join(', ');
    }
};

/**
 * Format sizes for customer display (sizes only, no quantities)
 * @param {Array|string} sizes - Product sizes data
 * @returns {string} Formatted string like "7, 8, 9"
 */
export const formatSizesForCustomer = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (sizesArray.length === 0) return 'N/A';
    
    if (isSizeQuantityFormat(sizesArray)) {
        // New format: extract only size numbers
        return sizesArray.map(sizeObj => sizeObj.size).join(', ');
    } else {
        // Legacy format: array of numbers/strings
        return sizesArray.join(', ');
    }
};

/**
 * Get only size numbers from size-quantity objects
 * Used by product cards to display available sizes
 * @param {Array|string} sizes - Product sizes data
 * @returns {Array} Array of size numbers
 */
export const extractSizeNumbers = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (isSizeQuantityFormat(sizesArray)) {
        return sizesArray.map(sizeObj => sizeObj.size);
    } else {
        return sizesArray;
    }
};

/**
 * Get total quantity from size-quantity objects
 * @param {Array|string} sizes - Product sizes data
 * @returns {number} Total quantity across all sizes
 */
export const getTotalQuantity = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (isSizeQuantityFormat(sizesArray)) {
        return sizesArray.reduce((total, sizeObj) => total + (sizeObj.quantity || 0), 0);
    } else {
        return 0; // Legacy format doesn't have quantities
    }
};

/**
 * Check if a product has available stock
 * @param {Array|string} sizes - Product sizes data
 * @returns {boolean} True if any size has quantity > 0
 */
export const hasAvailableStock = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (isSizeQuantityFormat(sizesArray)) {
        return sizesArray.some(sizeObj => (sizeObj.quantity || 0) > 0);
    } else {
        return true; // Legacy format assumes stock is available
    }
};

/**
 * Convert legacy size string to new size-quantity format
 * @param {string} sizesString - Comma-separated size string
 * @param {number} totalStock - Total stock quantity to distribute
 * @returns {Array} Array of size-quantity objects
 */
export const convertLegacySizesToNewFormat = (sizesString, totalStock = 0) => {
    if (!sizesString || !sizesString.trim()) return [];
    
    const sizesArray = sizesString.split(',').map(size => size.trim()).filter(size => size !== '');
    
    if (sizesArray.length === 0) return [];
    
    // Distribute stock evenly across sizes
    const quantityPerSize = Math.max(1, Math.floor(totalStock / sizesArray.length));
    
    return sizesArray.map(size => {
        const sizeNumber = parseFloat(size);
        return {
            size: isNaN(sizeNumber) ? 0 : sizeNumber,
            quantity: quantityPerSize
        };
    }).filter(sizeObj => sizeObj.size > 0);
};

/**
 * Convert new size-quantity format to display string
 * @param {Array} sizes - Array of size-quantity objects
 * @returns {string} Comma-separated size string for display
 */
export const convertSizesToDisplayString = (sizes) => {
    if (!sizes || !Array.isArray(sizes)) return '';
    
    return sizes.map(sizeObj => sizeObj.size).join(', ');
};

/**
 * Parse size numbers for filtering operations
 * Used when filtering products by size
 * @param {Array|string} sizes - Product sizes data
 * @returns {Array} Array of size numbers as floats
 */
export const parseSizeForFiltering = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (!Array.isArray(sizesArray)) return [];
    
    // Extract size numbers from size objects or parse directly
    return sizesArray.map(sizeObj => {
        if (typeof sizeObj === 'object' && sizeObj.size !== undefined) {
            return parseFloat(sizeObj.size);
        }
        return parseFloat(sizeObj);
    }).filter(size => !isNaN(size));
};

// ============================================================================
// STOCK STATUS & AVAILABILITY
// ============================================================================

/**
 * Get available quantity for a specific size
 * @param {Array|string} sizes - Product sizes data
 * @param {string|number} selectedSize - The size to check
 * @param {number} fallbackStock - Fallback stock if size not found or legacy format
 * @returns {number} Available quantity for the size
 */
export const getStockForSize = (sizes, selectedSize, fallbackStock = 0) => {
    if (!selectedSize) return fallbackStock;
    
    const sizesArray = parseSizesData(sizes);
    
    if (!Array.isArray(sizesArray) || sizesArray.length === 0) {
        return fallbackStock;
    }
    
    // Check if it's the new size-quantity format
    if (isSizeQuantityFormat(sizesArray)) {
        const sizeObj = sizesArray.find(s => s.size == selectedSize);
        return sizeObj ? (sizeObj.quantity || 0) : 0;
    }
    
    // Legacy format - return fallback stock
    return fallbackStock;
};

/**
 * Get only sizes that have stock available
 * @param {Array|string} sizes - Product sizes data
 * @returns {Array} Array of sizes with quantity > 0
 */
export const getAvailableSizesWithStock = (sizes) => {
    const sizesArray = parseSizesData(sizes);
    
    if (!Array.isArray(sizesArray) || sizesArray.length === 0) {
        return [];
    }
    
    // Check if it's the new size-quantity format
    if (isSizeQuantityFormat(sizesArray)) {
        // Filter only sizes with quantity > 0
        return sizesArray.filter(sizeObj => (sizeObj.quantity || 0) > 0);
    }
    
    // Legacy format - return all sizes (assume stock available)
    return sizesArray;
};

/**
 * Check if a specific size has sufficient stock
 * @param {Array|string} sizes - Product sizes data
 * @param {string|number} selectedSize - The size to check
 * @param {number} requestedQuantity - Quantity requested
 * @returns {boolean} True if sufficient stock available
 */
export const hasSufficientStock = (sizes, selectedSize, requestedQuantity) => {
    const availableStock = getStockForSize(sizes, selectedSize);
    return availableStock >= requestedQuantity;
};

/**
 * Get stock status string
 * @param {number} quantity - Stock quantity
 * @param {number} lowStockThreshold - Threshold for low stock warning (default: 10)
 * @returns {string} Status: 'Out of Stock' | 'Low Stock' | 'In Stock'
 */
export const getStockStatus = (quantity, lowStockThreshold = 10) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
};

/**
 * Get CSS class name for stock badge
 * @param {number} quantity - Stock quantity
 * @param {number} lowStockThreshold - Threshold for low stock warning (default: 10)
 * @returns {string} CSS class name
 */
export const getStockBadgeClass = (quantity, lowStockThreshold = 10) => {
    if (quantity === 0) return 'outOfStock';
    if (quantity <= lowStockThreshold) return 'lowStock';
    return 'inStock';
};

// ============================================================================
// PRICE FORMATTING (Re-exported from price.utils.js for convenience)
// ============================================================================

// Re-export formatPrice as formatProductPrice for backward compatibility
export const formatProductPrice = formatPrice;

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort products by various criteria
 * @param {Array} products - Array of products to sort
 * @param {string} sortBy - Sort criteria: 'name' | 'price-low' | 'price-high' | 'newest' | 'oldest' | 'size-low' | 'size-high'
 * @returns {Array} Sorted array of products (creates a copy, doesn't mutate original)
 */
export const sortProducts = (products, sortBy = 'name') => {
    // Create a copy to avoid mutating the original array
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'name':
            // Alphabetical sort (A-Z)
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            
        case 'price-low':
            // Price: low to high
            return sortedProducts.sort((a, b) => a.price - b.price);
            
        case 'price-high':
            // Price: high to low
            return sortedProducts.sort((a, b) => b.price - a.price);
            
        case 'newest':
            // Date: newest first
            return sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            
        case 'oldest':
            // Date: oldest first
            return sortedProducts.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            
        case 'size-low':
            // Size: low to high (using minimum size available)
            return sortedProducts.sort((a, b) => {
                const aMinSize = Math.min(...parseSizeForFiltering(a.sizes));
                const bMinSize = Math.min(...parseSizeForFiltering(b.sizes));
                return aMinSize - bMinSize;
            });
            
        case 'size-high':
            // Size: high to low (using maximum size available)
            return sortedProducts.sort((a, b) => {
                const aMaxSize = Math.max(...parseSizeForFiltering(a.sizes));
                const bMaxSize = Math.max(...parseSizeForFiltering(b.sizes));
                return bMaxSize - aMaxSize;
            });
            
        default:
            // No sorting or invalid sort type
            return sortedProducts;
    }
};

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Validate filter range values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} absoluteMin - Absolute minimum allowed
 * @param {number} absoluteMax - Absolute maximum allowed
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateFilterRange = (min, max, absoluteMin, absoluteMax) => {
    // Check if values are numbers
    if (typeof min !== 'number' || typeof max !== 'number') {
        return { isValid: false, error: 'Values must be numbers' };
    }
    
    // Check if values are within absolute bounds
    if (min < absoluteMin || min > absoluteMax) {
        return { isValid: false, error: `Minimum must be between ${absoluteMin} and ${absoluteMax}` };
    }
    
    if (max < absoluteMin || max > absoluteMax) {
        return { isValid: false, error: `Maximum must be between ${absoluteMin} and ${absoluteMax}` };
    }
    
    // Check if min is less than max
    if (min >= max) {
        return { isValid: false, error: 'Minimum must be less than maximum' };
    }
    
    return { isValid: true, error: '' };
};

/**
 * Validate price range filter
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePriceRange = (minPrice, maxPrice) => {
    return validateFilterRange(minPrice, maxPrice, 0, 999999.99);
};

/**
 * Validate size range filter
 * @param {number} minSize - Minimum size
 * @param {number} maxSize - Maximum size
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateSizeRange = (minSize, maxSize) => {
    return validateFilterRange(minSize, maxSize, 0, 999);
};

/**
 * Filter products by price range
 * @param {Array} products - Array of products
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} Filtered products
 */
export const filterByPriceRange = (products, minPrice, maxPrice) => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
        const price = parseFloat(product.price);
        if (isNaN(price)) return false;
        return price >= minPrice && price <= maxPrice;
    });
};

/**
 * Filter products by size range
 * @param {Array} products - Array of products
 * @param {number} minSize - Minimum size
 * @param {number} maxSize - Maximum size
 * @returns {Array} Filtered products
 */
export const filterBySizeRange = (products, minSize, maxSize) => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
        const sizes = parseSizeForFiltering(product.sizes);
        if (!sizes || sizes.length === 0) return false;
        
        // Check if any size falls within the range
        return sizes.some(size => size >= minSize && size <= maxSize);
    });
};

/**
 * Get min and max price from products array
 * @param {Array} products - Array of products
 * @returns {Object} { min: number, max: number }
 */
export const getPriceRange = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        return { min: 0, max: 1000 };
    }
    
    const prices = products.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
    
    if (prices.length === 0) {
        return { min: 0, max: 1000 };
    }
    
    return {
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
    };
};

/**
 * Get min and max size from products array
 * @param {Array} products - Array of products
 * @returns {Object} { min: number, max: number }
 */
export const getSizeRange = (products) => {
    if (!Array.isArray(products) || products.length === 0) {
        return { min: 3, max: 15 };
    }
    
    const allSizes = [];
    products.forEach(product => {
        const sizes = parseSizeForFiltering(product.sizes);
        allSizes.push(...sizes);
    });
    
    if (allSizes.length === 0) {
        return { min: 3, max: 15 };
    }
    
    return {
        min: Math.floor(Math.min(...allSizes)),
        max: Math.ceil(Math.max(...allSizes))
    };
};

/**
 * Apply all filters to products
 * @param {Array} products - Array of products
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered and sorted products
 */
export const applyFilters = (products, filters) => {
    if (!Array.isArray(products)) return [];
    if (!filters) return products;
    
    let filtered = [...products];
    
    // Apply price range filter
    if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        filtered = filterByPriceRange(filtered, min, max);
    }
    
    // Apply size range filter
    if (filters.sizeRange) {
        const { min, max } = filters.sizeRange;
        filtered = filterBySizeRange(filtered, min, max);
    }
    
    // Apply sorting
    if (filters.sortBy) {
        filtered = sortProducts(filtered, filters.sortBy);
    }
    
    return filtered;
};

// ============================================================================
// DATA VALIDATION (from validators.js)
// ============================================================================

/**
 * Validate sizes array - checks for duplicates and ensures valid format
 * @param {Array} sizes - Array of size objects {size, quantity}
 * @param {Array} existingSizes - Optional: existing sizes from product (to prevent changing sizes)
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateSizes = (sizes, existingSizes = []) => {
    const errors = [];
    
    if (!Array.isArray(sizes)) {
        return { isValid: false, errors: ['Sizes must be an array'] };
    }
    
    if (sizes.length === 0) {
        return { isValid: true, errors: [] };
    }
    
    const seenSizes = new Set();
    const existingSizeNumbers = new Set(existingSizes.map(s => parseFloat(s.size)).filter(n => !isNaN(n)));
    
    sizes.forEach((sizeObj, index) => {
        // Validate size object structure
        if (!sizeObj || typeof sizeObj !== 'object') {
            errors.push(`Size at position ${index + 1} must be an object`);
            return;
        }
        
        // Validate size property
        if (sizeObj.size === undefined || sizeObj.size === null || sizeObj.size === '') {
            errors.push(`Size number is required at position ${index + 1}`);
            return;
        }
        
        const sizeNumber = parseFloat(sizeObj.size);
        if (isNaN(sizeNumber)) {
            errors.push(`Size "${sizeObj.size}" is not a valid number at position ${index + 1}`);
            return;
        }
        
        if (sizeNumber <= 0) {
            errors.push(`Size "${sizeObj.size}" must be greater than 0 at position ${index + 1}`);
            return;
        }
        
        if (sizeNumber > 999) {
            errors.push(`Size "${sizeObj.size}" must be less than 1000 at position ${index + 1}`);
            return;
        }
        
        // Check for duplicate sizes in the new array (normalize to string for comparison)
        const sizeKey = sizeNumber.toString();
        if (seenSizes.has(sizeKey)) {
            errors.push(`Duplicate size "${sizeNumber}" found. Each size can only appear once.`);
            return;
        }
        seenSizes.add(sizeKey);
        
        // Validate quantity property
        if (sizeObj.quantity === undefined || sizeObj.quantity === null || sizeObj.quantity === '') {
            errors.push(`Quantity is required for size ${sizeObj.size}`);
            return;
        }
        
        const quantity = parseInt(sizeObj.quantity);
        if (isNaN(quantity)) {
            errors.push(`Quantity for size ${sizeObj.size} must be a valid number`);
            return;
        }
        
        if (quantity < 0) {
            errors.push(`Quantity for size ${sizeObj.size} cannot be negative`);
            return;
        }
        
        if (quantity > 999999) {
            errors.push(`Quantity for size ${sizeObj.size} must be less than 1,000,000`);
            return;
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

/**
 * Validate product form data
 * @param {Object} formData - Product form data
 * @param {Array} categories - Available categories for validation
 * @param {Array} existingSizes - Optional: existing sizes from product (to prevent changing sizes)
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateProductForm = (formData, categories = [], existingSizes = []) => {
    const errors = {};
    
    // Validate product name
    if (!formData.name || !formData.name.trim()) {
        errors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
        errors.name = 'Product name must be at least 2 characters long';
    } else if (formData.name.trim().length > 100) {
        errors.name = 'Product name must be less than 100 characters';
    }
    
    // Validate price
    if (!formData.price || formData.price === '') {
        errors.price = 'Price is required';
    } else {
        const price = parseFloat(formData.price);
        if (isNaN(price)) {
            errors.price = 'Price must be a valid number';
        } else if (price <= 0) {
            errors.price = 'Price must be greater than 0';
        } else if (price > 999999.99) {
            errors.price = 'Price must be less than $1,000,000';
        }
    }
    
    // Validate description (optional)
    if (formData.description && formData.description.trim().length > 500) {
        errors.description = 'Product description must be less than 500 characters';
    }
    
    // Validate category
    if (!formData.category_id || formData.category_id === '') {
        errors.category_id = 'Please select a valid category';
    }
    
    // Validate sizes - new format with size-quantity objects
    if (formData.sizes && formData.sizes.length > 0) {
        const sizeValidation = validateSizes(formData.sizes, existingSizes);
        if (!sizeValidation.isValid) {
            errors.sizes = sizeValidation.errors.join('; ');
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

/**
 * Validate individual size quantity object
 * @param {Object} sizeQty - Size quantity object { size, quantity }
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateSizeQuantity = (sizeQty) => {
    // Validate size
    if (sizeQty.size === undefined || sizeQty.size === null) {
        return { isValid: false, message: 'Size is required' };
    }
    
    if (typeof sizeQty.size !== 'number' && typeof sizeQty.size !== 'string') {
        return { isValid: false, message: 'Size must be a number or string' };
    }
    
    // Validate quantity
    if (sizeQty.quantity === undefined || sizeQty.quantity === null) {
        return { isValid: false, message: 'Quantity is required' };
    }
    
    if (typeof sizeQty.quantity !== 'number') {
        return { isValid: false, message: 'Quantity must be a number' };
    }
    
    if (sizeQty.quantity < 0) {
        return { isValid: false, message: 'Quantity cannot be negative' };
    }
    
    if (sizeQty.quantity > 1000) {
        return { isValid: false, message: 'Quantity cannot exceed 1000' };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Calculate total quantity for a product
 * @param {Object} product - Product object with sizeQuantities array
 * @returns {number} Total quantity
 */
export const calculateTotalProductQuantity = (product) => {
    if (!product) return 0;
    
    if (product.sizeQuantities && Array.isArray(product.sizeQuantities)) {
        return product.sizeQuantities.reduce((total, sq) => {
            return total + (typeof sq.quantity === 'number' ? sq.quantity : 0);
        }, 0);
    }
    
    // Fallback for legacy quantity field
    return typeof product.quantity === 'number' ? product.quantity : 0;
};

/**
 * Check if a product has any quantities selected
 * @param {Object} product - Product object with sizeQuantities array
 * @returns {boolean} True if product has quantities > 0
 */
export const hasProductQuantities = (product) => {
    if (!product) return false;
    
    if (product.sizeQuantities && Array.isArray(product.sizeQuantities)) {
        return product.sizeQuantities.some(sq => 
            typeof sq.quantity === 'number' && sq.quantity > 0
        );
    }
    
    // Fallback for legacy quantity field
    return typeof product.quantity === 'number' && product.quantity > 0;
};

// ============================================================================
// DATA TRANSFORMATION (Frontend ↔ Backend)
// ============================================================================

/**
 * Prepare product data for backend submission
 * Ensures data integrity and correct types
 * @param {Object} productData - Raw product form data
 * @returns {Object} Sanitized product data ready for API
 */
export const prepareProductForBackend = (productData) => {
    return {
        ...productData,
        price: parseFloat(productData.price),
        category_id: productData.category_id ? parseInt(productData.category_id) : null,
        sizes: Array.isArray(productData.sizes) 
            ? productData.sizes.filter(sizeObj => sizeObj.size && sizeObj.quantity !== undefined)
            : []
    };
};

/**
 * Parse product data received from backend
 * Ensures consistent format for frontend consumption
 * Note: Import parseImageUrls from image.utils.js when using this
 * @param {Object} backendProduct - Product data from API
 * @returns {Object} Parsed product ready for display
 */
export const parseProductFromBackend = (backendProduct) => {
    // Note: You may need to import { parseImageUrls } from './image.utils'
    // to avoid circular dependencies
    return {
        ...backendProduct,
        sizes: parseSizesData(backendProduct.sizes),
        stock_quantity: backendProduct.stock_quantity || 0,
        sizes_display: formatSizesForCustomer(backendProduct.sizes)
    };
};

