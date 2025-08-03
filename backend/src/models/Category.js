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
        await db.query('DELETE FROM categories WHERE category_id = ?', [categoryId]);
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



