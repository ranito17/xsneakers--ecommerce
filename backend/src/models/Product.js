// מודל המוצרים - מנהל את כל הפעולות הקשורות למוצרים במסד הנתונים
// מתחבר לבסיס הנתונים דרך dbSingleton לביצוע שאילתות
const dbSingleton = require('../config/database');

// קבלת כל המוצרים ממסד הנתונים
// פונקציה שמבצעת שאילתת SELECT ומחזירה את כל המוצרים עם מידע על הקטגוריה
async function getAllProducts() {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                p.*,
                c.category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            ORDER BY p.id DESC
        `);
        
        // Process image URLs and add category info
        const processedRows = rows.map(product => {
            let images = [];
            
            // Check if image_urls exists and has content
            if (product.image_urls && product.image_urls.trim()) {
                images = product.image_urls.split(',').map(url => url.trim()).filter(Boolean);
            }
            
            // Convert to full URLs
            const fullImageUrls = images.map(url => {
                if (url.startsWith('http')) {
                    return url; // Already a full URL
                } else if (url.startsWith('/uploads/')) {
                    return `http://localhost:3001${url}`; // Add base URL
                } else {
                    return `http://localhost:3001/uploads/products/${url}`; // Add full path
                }
            });
            
            return {
                ...product,
                image_urls: fullImageUrls.join(','),
                images: fullImageUrls, // Add images array for frontend convenience
                category: {
                    id: product.category_id,
                    name: product.category_name
                }
            };
        });
     
        
        return processedRows;
    } catch (err) {
        console.error('Error fetching products:', err);
        throw new Error('Failed to fetch products from database');
    }
}

// יצירת מוצר חדש במסד הנתונים
// פונקציה שמבצעת שאילתת INSERT ויוצרת מוצר חדש
async function createProduct(productData) {
    try {
        const db = await dbSingleton.getConnection();
        const [result] = await db.query(
            'INSERT INTO products (category_id, name, price, stock_quantity, description, color, sizes, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                productData.category_id,
                productData.name, 
                productData.price, 
                productData.stock_quantity || 0,
                productData.description || null,
                productData.color || null,
                productData.sizes ? JSON.stringify(productData.sizes) : null,
                productData.image_urls || null
            ]
        );
        return result;
    } catch (err) {
        console.error('Error creating product:', err);
        throw new Error('Failed to create product in database');
    }
}

// מחיקת מוצר ממסד הנתונים
// פונקציה שמבצעת שאילתת DELETE ומוחקת מוצר לפי מזהה
async function deleteProduct(id) {
    try {
        const db = await dbSingleton.getConnection();
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error deleting product:', err);
        throw new Error('Failed to delete product from database');
    }
}

// קבלת מוצר לפי מזהה עם מידע על הקטגוריה
async function getProductById(id) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return null;
        }
        
        const product = rows[0];
        
        // Process image URLs
        let images = [];
        if (product.image_urls && product.image_urls.trim()) {
            images = product.image_urls.split(',').map(url => url.trim()).filter(Boolean);
        }
        
        // Convert to full URLs
        const fullImageUrls = images.map(url => {
            if (url.startsWith('http')) {
                return url;
            } else if (url.startsWith('/uploads/')) {
                return `http://localhost:3001${url}`;
            } else {
                return `http://localhost:3001/uploads/products/${url}`;
            }
        });
        
        return {
            ...product,
            image_urls: fullImageUrls.join(','),
            images: fullImageUrls,
            category: {
                id: product.category_id,
                name: product.category_name
            }
        };
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        throw new Error('Failed to fetch product from database');
    }
}

// עדכון מוצר במסד הנתונים
// פונקציה שמבצעת שאילתת UPDATE ועדכנת מוצר קיים
async function updateProduct(id, productData) {
    try {
        const db = await dbSingleton.getConnection();
        const [result] = await db.query(
            'UPDATE products SET category_id = ?, name = ?, price = ?, stock_quantity = ?, description = ?, color = ?, sizes = ?, image_urls = ? WHERE id = ?',
            [
                productData.category_id,
                productData.name,
                productData.price,
                productData.stock_quantity,
                productData.description,
                productData.color,
                productData.sizes ? JSON.stringify(productData.sizes) : null,
                productData.image_urls,
                id
            ]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating product:', err);
        throw new Error('Failed to update product in database');
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};