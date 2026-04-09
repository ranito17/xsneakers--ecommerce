// בקר המוצרים - מנהל את כל הפעולות הקשורות למוצרים
// מתחבר למודל Product לביצוע פעולות בסיס הנתונים
const Product = require('../models/Product');
const Analytics = require('../models/Analytics');
const {
    validateProductIdParam,
    validateCreateProductPayload,
    validateUpdateProductPayload,
    validateUpdateProductSizesPayload
} = require('../validation/productValidator');

// קבלת כל המוצרים מהמסד נתונים
// השליטה מקבלת בקשה מהלקוח או אדמין ושולחת אותה למודל המתאים
const getProducts = async (req, res) => {
    try {
        const { audience = 'customer' } = req.query;

        // שימוש בפונקציות נפרדות - יותר ברור ופשוט
        let products;
        if (audience === 'admin') {
            // אדמין - כל המוצרים עם כל המידע
            products = await Product.getAllProductsForAdmin();
        } else {
            // לקוח - רק מוצרים פעילים עם מלאי, ללא מידע מיותר
            products = await Product.getAllProductsForCustomer();
        }

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
};

// קבלת מוצר לפי מזהה מהמסד נתונים
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const idValidation = validateProductIdParam(id);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const product = await Product.getProductById(idValidation.sanitized);
        
        if (product) {
            res.status(200).json({
                success: true,
                data: product
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

// עדכון מוצר במסד הנתונים
// השליטה מקבלת מזהה מוצר ונתונים חדשים ושולחת אותם למודל לעדכון
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const idValidation = validateProductIdParam(id);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const validation = validateUpdateProductPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const result = await Product.updateProduct(idValidation.sanitized, validation.sanitizedData);
        
        if (result) {
            res.json({
                success: true,
                message: 'Product updated successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        // אם זה שגיאה של קטגוריה לא פעילה, נחזיר אותה במפורש
        if (error.message === 'Cannot activate product because the category is deactivated') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
};

// יצירת מוצר חדש במסד הנתונים
// השליטה מקבלת נתוני מוצר חדש ושולחת אותם למודל ליצירה
const createProduct = async (req, res) => {
    try {
        const validation = validateCreateProductPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const result = await Product.createProduct(validation.sanitizedData);
        
        // Check if product creation failed (duplicate name)
        if (result.success === false) {
            return res.status(400).json({
                success: false,
                message: result.message || 'Product with this name already exists'
            });
        }
        
        res.json({
            success: true,
            message: 'Product created successfully',
            productId: result.data?.insertId
        });
    } catch (error) {
        // אם זה שגיאה של שם קיים, נחזיר אותה במפורש
        if (error.message === 'Product with this name already exists') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
};

// נקודות קצה אנליטיקס לדשבורד
const getLowStockProducts = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;
        const products = await Product.getLowStockProducts(threshold);
        res.status(200).json({
            success: true,
            message: 'Low stock products retrieved successfully',
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock products'
        });
    }
};

const getProductStats = async (req, res) => {
    try {
        const stats = await Analytics.getProductStats();
        res.status(200).json({
            success: true,
            message: 'Product statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product statistics'
        });
    }
};


// עדכון כל הגדלים של מוצר בבת אחת
const updateProductSizes = async (req, res) => {
    try {
        const { productId } = req.params;
        const idValidation = validateProductIdParam(productId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const validation = validateUpdateProductSizesPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const result = await Product.updateProductSizes(idValidation.sanitized, validation.sanitizedData.sizes);
        
        res.json({
            success: true,
            message: 'Product sizes updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error updating product sizes:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update product sizes'
        });
    }
};


// קבלת מלאי זמין לגדל ספציפי
const getStockForSize = async (req, res) => {
    try {
        const { productId, size } = req.params;
        const stock = await Product.getStockForSize(productId, size);
        
        res.json({
            success: true,
            data: { stock }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get stock for size'
        });
    }
};

// קבלת מוצרים עם גדלים במלאי נמוך
const getProductsWithLowStockSizes = async (req, res) => {
    try {
        const Settings = require('../models/Settings');
        // קבלת סף מהגדרות, נסיגה לפרמטר query או ברירת מחדל
        const settings = await Settings.getSettings();
        const sizeThreshold = parseInt(req.query.sizeThreshold) || settings.low_stock_threshold_per_size || 5;
        const products = await Product.getProductsWithLowStockSizes(sizeThreshold);
        
        res.json({
            success: true,
            message: `Found ${products.length} products with sizes below threshold`,
            data: products
        });
    } catch (error) {
        console.error('Error in getProductsWithLowStockSizes controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products with low stock sizes',
            data: null
        });
    }
};

// Get top products with sales data
const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Product.getTopProducts();
        res.status(200).json({
            success: true,
            data: topProducts
        });
    } catch (err) {
        console.error('Error in getTopProducts:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch top products',
            data: null
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    getLowStockProducts,
    getProductsWithLowStockSizes,
    getProductStats,
    updateProductSizes, // פונקציה לעדכון כל הגדלים בבת אחת
    getStockForSize,
    getTopProducts
};