const dbSingleton = require('../config/database');
const { normalizeImageUrls, imageUrlsToString } = require('../utils/image');
async function getCategories() {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query('SELECT * FROM categories');
        return rows;
    } catch (err) {
        throw new Error('Failed to fetch categories from database');
    }
}
// פונקציית אדמין: יצירת קטגוריה חדשה
async function addCategory(categoryData) {
    try {
        const db = await dbSingleton.getConnection();
        const { category_name, description, image_url } = categoryData;
        
        // בדיקה אם קטגוריה עם שם זה כבר קיימת
        const [existingCategories] = await db.query(
            'SELECT category_id FROM categories WHERE category_name = ?',
            [category_name]
        );
        
        if (existingCategories.length > 0) {
            throw new Error('Category with this name already exists');
        }
        
        // הכנסת קטגוריה חדשה עם image_url כ-JSON array
        const imageUrls = image_url ? imageUrlsToString(image_url, 'category') : null;
        const [result] = await db.query(
            'INSERT INTO categories (category_name, description, image_urls, is_active) VALUES (?, ?, ?, 1)',
            [category_name, description || null, imageUrls]
        );
        
        return {
            category_id: result.insertId,
            category_name: category_name,
            description: description,
            image_urls: imageUrls,
images: imageUrls ? normalizeImageUrls(imageUrls, 'category') : []
        };
    } catch (err) {
        throw err;
    }
}

async function updateCategory(categoryId, categoryData) {
    try {
        const db = await dbSingleton.getConnection();
        const { category_name, description, image_url, is_active } = categoryData;
        
        // בדיקה אם הקטגוריה קיימת
        const [existingCategory] = await db.query(
            'SELECT category_id FROM categories WHERE category_id = ?',
            [categoryId]
        );
        
        if (existingCategory.length === 0) {
            throw new Error('Category not found');
        }
        
        // בדיקה אם שם חדש מתנגש עם קטגוריה קיימת (למעט הקטגוריה הנוכחית)
        if (category_name) {
            const [conflictingCategories] = await db.query(
                'SELECT category_id FROM categories WHERE category_name = ? AND category_id != ?',
                [category_name, categoryId]
            );
            
            if (conflictingCategories.length > 0) {
                throw new Error('Category with this name already exists');
            }
        }
        
        // בניית שאילתת עדכון דינמית לפי השדות שסופקו
        let updateFields = [];
        let updateValues = [];
        
        if (category_name !== undefined) {
            updateFields.push('category_name = ?');
            updateValues.push(category_name);
        }
        
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description || null);
        }
        
        if (image_url !== undefined) {
            updateFields.push('image_urls = ?');
            updateValues.push(image_url ? imageUrlsToString(image_url, 'category') : null);
        }
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active ? 1 : 0);
        }
        
        if (updateFields.length === 0) {
            // אין שדות לעדכון, מחזיר את הקטגוריה הנוכחית
            const [currentCategory] = await db.query(
                'SELECT * FROM categories WHERE category_id = ?',
                [categoryId]
            );
            return currentCategory[0];
        }
        
        updateValues.push(categoryId);
        
        const [result] = await db.query(
            `UPDATE categories SET ${updateFields.join(', ')} WHERE category_id = ?`,
            updateValues
        );
        
        // קבלת קטגוריה מעודכנת
        const [updatedCategory] = await db.query(
            'SELECT * FROM categories WHERE category_id = ?',
            [categoryId]
        );
        
        return updatedCategory[0];
    } catch (err) {
        throw err;
    }
}
// פונקציית אדמין: השבתת קטגוריה וכל מוצריה
async function deactivateCategory(categoryId) {
    let db;
    try {
        db = await dbSingleton.getDedicatedConnection();

        // בדיקה אם הקטגוריה קיימת
        const [categoryRows] = await db.query(
            'SELECT category_id, category_name, is_active FROM categories WHERE category_id = ?',
            [categoryId]
        );

        if (categoryRows.length === 0) {
            throw new Error('Category not found');
        }

        // התחלת טרנזקציה: השבתת הקטגוריה + השבתת כל המוצרים בקטגוריה
        await db.beginTransaction();
        try {
            await db.query(
                'UPDATE categories SET is_active = 0 WHERE category_id = ?',
                [categoryId]
            );

            const [productUpdate] = await db.query(
                'UPDATE products SET is_active = 0 WHERE category_id = ?',
                [categoryId]
            );

            await db.commit();

            return {
                success: true,
                deactivatedProducts: productUpdate.affectedRows || 0,
                message: 'Category deactivated successfully; associated products deactivated as well'
            };
        } catch (err) {
            await db.rollback();
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (db) {
            try {
                await db.release();
            } catch (closeError) {
                // preserve existing behavior
            }
        }
    }
}

// פונקציית אדמין: הפעלת קטגוריה וכל מוצריה
async function activateCategory(categoryId) {
    let db;
    try {
        db = await dbSingleton.getDedicatedConnection();

        // בדיקה אם הקטגוריה קיימת
        const [categoryRows] = await db.query(
            'SELECT category_id, category_name, is_active FROM categories WHERE category_id = ?',
            [categoryId]
        );

        if (categoryRows.length === 0) {
            throw new Error('Category not found');
        }

        // התחלת טרנזקציה: הפעלת הקטגוריה + הפעלת כל המוצרים בקטגוריה
        await db.beginTransaction();
        try {
            await db.query(
                'UPDATE categories SET is_active = 1 WHERE category_id = ?',
                [categoryId]
            );

            const [productUpdate] = await db.query(
                'UPDATE products SET is_active = 1 WHERE category_id = ?',
                [categoryId]
            );

            await db.commit();

            return {
                success: true,
                activatedProducts: productUpdate.affectedRows || 0,
                message: 'Category activated successfully; associated products activated as well'
            };
        } catch (err) {
            await db.rollback();
            throw err;
        }
    } catch (err) {
        throw err;
    } finally {
        if (db) {
            try {
                await db.release();
            } catch (closeError) {
                // preserve existing behavior
            }
        }
    }
}

module.exports = {  
    getCategories,
    addCategory,
    updateCategory,
    deactivateCategory,
    activateCategory
};



