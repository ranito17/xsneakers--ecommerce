const Category = require('../models/Category');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.getCategories();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (err) {
        console.error('Controller error in getCategories:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

const addCategory = async (req, res) => {
    try {
        const { category_name, description } = req.body;
        
      
        
        const categoryData = {
            category_name: category_name.trim(),
            description: description 
        };
        
        const newCategory = await Category.addCategory(categoryData);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (err) {
        console.error('Controller error in addCategory:', err);
        
        if (err.message === 'Category with this name already exists') {
            return res.status(409).json({
                success: false,
                message: err.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Category.deleteCategory(id);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                deletedProducts: result.deletedProducts
            }
        });
    } catch (err) {
        console.error('Controller error in deleteCategory:', err);
        
        if (err.message === 'Category not found') {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    getCategories,
    addCategory,
    deleteCategory
};