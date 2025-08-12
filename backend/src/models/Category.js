const dbSingleton = require('../config/database');

async function getCategories() {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query('SELECT * FROM categories');
        return rows; // Return clean data only
    } catch (err) {
        console.error('Database error in getCategories:', err);
        throw new Error('Failed to fetch categories from database');
    }
}
async function addCategory(categoryData) {
    try {
        const db = await dbSingleton.getConnection();
        const { category_name, description } = categoryData;
        
        // Check if category already exists
        const [existingCategories] = await db.query(
            'SELECT category_id FROM categories WHERE category_name = ?',
            [category_name.trim()]
        );
        
        if (existingCategories.length > 0) {
            throw new Error('Category with this name already exists');
        }
        
        // Insert new category
        const [result] = await db.query(
            'INSERT INTO categories (category_name, description) VALUES (?, ?)',
            [category_name.trim(), description ? description.trim() : null]
        );
        
        return {
            category_id: result.insertId,
            category_name: category_name.trim(),
            description: description 
        };
    } catch (err) {
        console.error('Database error in addCategory:', err);
        throw err;
    }
}
async function deleteCategory(categoryId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Start a transaction to ensure data consistency
        await db.beginTransaction();
        
        try {
            // First, get the count of products in this category for logging
            const [productCount] = await db.query(
                'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
                [categoryId]
            );
            
            console.log(`🗑️ Deleting category ${categoryId} with ${productCount[0].count} products`);
            
            // Delete all products in this category first (cascade delete)
            const [deleteProductsResult] = await db.query(
                'DELETE FROM products WHERE category_id = ?',
                [categoryId]
            );
            
            console.log(`🗑️ Deleted ${deleteProductsResult.affectedRows} products from category ${categoryId}`);
            
            // Then delete the category itself
            const [deleteCategoryResult] = await db.query(
                'DELETE FROM categories WHERE category_id = ?',
                [categoryId]
            );
            
            if (deleteCategoryResult.affectedRows === 0) {
                throw new Error('Category not found');
            }
            
            console.log(`🗑️ Successfully deleted category ${categoryId}`);
            
            // Commit the transaction
            await db.commit();
            
            return {
                success: true,
                deletedProducts: deleteProductsResult.affectedRows,
                message: `Category and ${deleteProductsResult.affectedRows} products deleted successfully`
            };
            
        } catch (err) {
            // Rollback the transaction if any error occurs
            await db.rollback();
            throw err;
        }
        
    } catch (err) {
        console.error('Database error in deleteCategory:', err);
        throw new Error('Failed to delete category from database');
    }
}
module.exports = {  
    getCategories,
    addCategory,
    deleteCategory
};



