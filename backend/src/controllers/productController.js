// בקר המוצרים - מנהל את כל הפעולות הקשורות למוצרים
// מתחבר למודל Product לביצוע פעולות בסיס הנתונים
const Product = require('../models/Product');

// קבלת כל המוצרים מהמסד נתונים
// השליטה מקבלת בקשה מהלקוח ושולחת אותה למודל
const getProducts = async (req, res) => {
    try {
        const products = await Product.getAllProducts();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
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
        const product = await Product.getProductById(id);
        
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
        console.error('Error fetching product by ID:', error);
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
        const productData = req.body;
        const result = await Product.updateProduct(id, productData);
        
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
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
};

// מחיקת מוצר ממסד הנתונים
// השליטה מקבלת מזהה מוצר ושולחת אותו למודל למחיקה
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Product.deleteProduct(id);
        
        if (result) {   
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
};

// יצירת מוצר חדש במסד הנתונים
// השליטה מקבלת נתוני מוצר חדש ושולחת אותם למודל ליצירה
const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const result = await Product.createProduct(productData);
        
        res.json({
            success: true,
            message: 'Product created successfully',
            productId: result.insertId
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
};

// Dashboard Analytics Endpoints
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
        console.error('Error fetching low stock products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch low stock products'
        });
    }
};

const getProductStats = async (req, res) => {
    try {
        const stats = await Product.getProductStats();
        res.status(200).json({
            success: true,
            message: 'Product statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching product stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product statistics'
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    getProductStats
};