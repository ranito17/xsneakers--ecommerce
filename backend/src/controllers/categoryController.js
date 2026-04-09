const Category = require('../models/Category');
const {
    validateCategoryIdParam,
    validateCreateCategoryPayload,
    validateUpdateCategoryPayload
} = require('../validation/categoryValidator');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.getCategories();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

const addCategory = async (req, res) => {
    try {
        const validation = validateCreateCategoryPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        const newCategory = await Category.addCategory(validation.sanitizedData);
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (err) {
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

const updateCategory = async (req, res) => {
    try {
        const idValidation = validateCategoryIdParam(req.params.id);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const validation = validateUpdateCategoryPayload(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        const updatedCategory = await Category.updateCategory(idValidation.sanitized, validation.sanitizedData);
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (err) {
        
        if (err.message === 'Category not found') {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        if (err.message === 'Category with this name already exists') {
            return res.status(409).json({
                success: false,
                message: err.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};

const uploadCategoryImage = async (req, res) => {
    try {
        const { categoryId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const imageUrl = `/uploads/category/${file.filename}`;
        
        // עדכון קטגוריה עם כתובת תמונה חדשה
        await Category.updateCategory(categoryId, { image_url: imageUrl });

        res.json({
            success: true,
            imageUrl: imageUrl,
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
};

const deleteCategoryImage = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { imageUrl } = req.body;

        const fs = require('fs').promises;
        const path = require('path');
        const uploadsRoot = path.join(__dirname, '..', 'uploads');

        // חילוץ שם קובץ מכתובת URL מלאה
        let filename;
        if (imageUrl.startsWith('/uploads/category/')) {
            filename = imageUrl.replace('/uploads/category/', '');
        } else {
            try {
                filename = new URL(imageUrl).pathname.replace('/uploads/category/', '');
            } catch {
                filename = imageUrl;
            }
        }

        // מחיקת הקובץ מהדיסק
        const filePath = path.join(uploadsRoot, 'category', filename);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
        }

        // הסרת תמונה ממסד הנתונים
        await Category.updateCategory(categoryId, { image_url: null });

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete image'
        });
    }
};

const deactivateCategory = async (req, res) => {
    try {
        const idValidation = validateCategoryIdParam(req.params.id);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const result = await Category.deactivateCategory(idValidation.sanitized);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                deactivatedProducts: result.deactivatedProducts
            }
        });
    } catch (err) {
        console.error('Controller error in deactivateCategory:', err);
        
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

const activateCategory = async (req, res) => {
    try {
        const idValidation = validateCategoryIdParam(req.params.id);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: idValidation.errors
            });
        }

        const result = await Category.activateCategory(idValidation.sanitized);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                activatedProducts: result.activatedProducts
            }
        });
    } catch (err) {
        console.error('Controller error in activateCategory:', err);
        
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
    updateCategory,
    deactivateCategory,
    activateCategory,
    uploadCategoryImage,
    deleteCategoryImage
};