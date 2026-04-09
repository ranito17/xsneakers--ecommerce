const dbSingleton = require('../config/database');

// קבלת עגלת קניות מלאה של משתמש עם פרטי מוצרים
// פונקציה שמחזירה את עגלת הקניות של המשתמש כולל כל הפריטים עם פרטי המוצרים
async function getUserCart(userId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // קבלת עגלה קיימת או יצירת עגלה חדשה
        let [cartRows] = await db.query(
            'SELECT * FROM carts WHERE user_id = ?',
            [userId]
        );
        
        let cart;
        if (cartRows.length === 0) {
            // יצירת עגלה חדשה למשתמש
            const [result] = await db.query(
                'INSERT INTO carts (user_id, total_cost) VALUES (?, 0.00)',
                [userId]
            );
            cart = {
                cart_id: result.insertId,
                user_id: userId,
                total_cost: 0.00
            };
        } else {
            cart = cartRows[0];
        }
        
        // קבלת פריטי עגלה עם פרטי מוצרים
        const [items] = await db.query(`
            SELECT 
                ci.cart_item_id as cartItemId,
                ci.product_id as id,
                ci.quantity,
                ci.selected_size,
                p.name,
                p.price,
                p.image_urls as images,
                p.stock_quantity,
                p.description,
                p.category_id,
                p.sizes
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart.cart_id]);
        
        return {
            cartId: cart.cart_id,
            items: items || [],
            totalCost: parseFloat(cart.total_cost) || 0
        };
        
    } catch (error) {
        throw error;
    }
}

// הוספת פריט לעגלת קניות
// פונקציה שמוסיפה מוצר לעגלה או מעדכנת כמות אם הפריט כבר קיים
async function addToCart(userId, productId, quantity = 1, selectedSize = null) {
    try {
        const db = await dbSingleton.getConnection();
        
        // קבלת עגלה קיימת או יצירת עגלה חדשה
        let [cartRows] = await db.query(
            'SELECT cart_id FROM carts WHERE user_id = ?',
            [userId]
        );
        
        let cartId;
        if (cartRows.length === 0) {
            const [result] = await db.query(
                'INSERT INTO carts (user_id, total_cost) VALUES (?, 0.00)',
                [userId]
            );
            cartId = result.insertId;
        } else {
            cartId = cartRows[0].cart_id;
        }
        
        // קבלת פרטי מוצר
        const [products] = await db.query(
            'SELECT id, price FROM products WHERE id = ?',
            [productId]
        );
        
        if (products.length === 0) {
            throw new Error('Product not found');
        }
        
        const product = products[0];
        
        // בדיקה אם הפריט כבר קיים בעגלה עם אותו גדל
        const [existingItems] = await db.query(
            'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND selected_size = ?',
            [cartId, productId, selectedSize]
        );
        
        if (existingItems.length > 0) {
            // עדכון כמות
            const newQuantity = existingItems[0].quantity + quantity;
            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
                [newQuantity, existingItems[0].cart_item_id]
            );
        } else {
            // הוספת פריט חדש
            await db.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, price, selected_size) VALUES (?, ?, ?, ?, ?)',
                [cartId, productId, quantity, product.price, selectedSize]
            );
        }
        
        // עדכון סה"כ עגלה
        await updateCartTotal(cartId);
        
        // החזרת עגלה מעודכנת
        const result = await getUserCart(userId);
        return result;
        
    } catch (error) {
        throw error;
    }
}

// עדכון כמות פריט בעגלה
// פונקציה שמעדכנת את הכמות של פריט ספציפי בעגלה
async function updateQuantity(userId, cartItemId, quantity) {
    try {
        const db = await dbSingleton.getConnection();
        
        // אימות שהפריט שייך למשתמש
        const [items] = await db.query(`
            SELECT ci.cart_id 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = ? AND c.user_id = ?
        `, [cartItemId, userId]);
        
        if (items.length === 0) {
            throw new Error('Cart item not found or access denied');
        }
        
        const cartId = items[0].cart_id;
        
        // עדכון כמות
        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
            [quantity, cartItemId]
        );
        
        // עדכון סה"כ עגלה
        await updateCartTotal(cartId);
        
        return await getUserCart(userId);
        
    } catch (error) {
        throw error;
    }
}

// הסרת פריט מעגלת קניות
// פונקציה שמוחקת פריט מהעגלה
async function removeFromCart(userId, cartItemId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // אימות שהפריט שייך למשתמש וקבלת cart_id
        const [items] = await db.query(`
            SELECT ci.cart_id, ci.cart_item_id
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = ? AND c.user_id = ?
        `, [cartItemId, userId]);
        
        if (items.length === 0) {
            throw new Error('Cart item not found or access denied');
        }
        
        const cartId = items[0].cart_id;
        
        // מחיקת פריט
        await db.query(
            'DELETE FROM cart_items WHERE cart_item_id = ?',
            [cartItemId]
        );
        
        // עדכון סה"כ עגלה
        await updateCartTotal(cartId);
        
        return await getUserCart(userId);
        
    } catch (error) {
        throw error;
    }
}

// ניקוי עגלת קניות
// פונקציה שמוחקת את כל הפריטים מהעגלה
async function clearCart(userId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // קבלת עגלה
        const [carts] = await db.query(
            'SELECT cart_id FROM carts WHERE user_id = ?',
            [userId]
        );
        
        if (carts.length === 0) {
            return { cartId: null, items: [], totalCost: 0 };
        }
        
        const cartId = carts[0].cart_id;
        
        // מחיקת כל הפריטים
        await db.query(
            'DELETE FROM cart_items WHERE cart_id = ?',
            [cartId]
        );
        
        // עדכון סה"כ עגלה
        await updateCartTotal(cartId);
        
        return await getUserCart(userId);
        
    } catch (error) {
        throw error;
    }
}

// פונקציה עזר לעדכון סה"כ עגלה
// מחשבת את הסה"כ מכל הפריטים ומעדכנת את הטבלה
async function updateCartTotal(cartId) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [totals] = await db.query(`
            SELECT SUM(ci.price * ci.quantity) as total
            FROM cart_items ci
            WHERE ci.cart_id = ?
        `, [cartId]);
        
        const total = totals[0].total || 0;
        
        await db.query(
            'UPDATE carts SET total_cost = ? WHERE cart_id = ?',
            [total, cartId]
        );
        
    } catch (error) {
        throw error;
    }
}

/**
 * Get cart analytics data for the specified date range
 * 
 * Calculates comprehensive cart metrics including:
 * - Total carts created
 * - Carts converted to orders
 * - Abandoned carts (not converted)
 * - Conversion rate
 * - Average cart value
 * - Average items per cart
 * 
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Cart analytics data
 */
async function getCartAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Get total carts (carts with items in the date range)
        // We'll use orders created_at as proxy since carts don't have created_at
        // We'll count carts that have items and the user has orders in the date range
        const [cartStats] = await db.query(`
            SELECT 
                COUNT(DISTINCT c.cart_id) as total_carts,
                COUNT(DISTINCT CASE WHEN o.order_id IS NOT NULL THEN c.cart_id END) as converted_carts,
                AVG(c.total_cost) as avg_cart_value,
                AVG(
                    (SELECT COUNT(*) FROM cart_items ci WHERE ci.cart_id = c.cart_id)
                ) as avg_items_per_cart,
                SUM(c.total_cost) as total_cart_value
            FROM carts c
            LEFT JOIN orders o ON c.user_id = o.user_id 
                AND o.created_at BETWEEN ? AND ?
            WHERE c.total_cost > 0
        `, [startDate, endDate]);
        
        const stats = cartStats[0];
        const totalCarts = parseInt(stats.total_carts) || 0;
        const convertedCarts = parseInt(stats.converted_carts) || 0;
        const abandonedCarts = totalCarts - convertedCarts;
        const conversionRate = totalCarts > 0 ? ((convertedCarts / totalCarts) * 100).toFixed(2) : 0;
        const avgCartValue = parseFloat(stats.avg_cart_value) || 0;
        const avgItemsPerCart = parseFloat(stats.avg_items_per_cart) || 0;
        
        // Get cart abandonment trend (carts with items but no order)
        const [abandonedCartsData] = await db.query(`
            SELECT 
                c.cart_id,
                c.user_id,
                c.total_cost,
                (SELECT COUNT(*) FROM cart_items ci WHERE ci.cart_id = c.cart_id) as item_count
            FROM carts c
            LEFT JOIN orders o ON c.user_id = o.user_id 
                AND o.created_at BETWEEN ? AND ?
            WHERE c.total_cost > 0 
                AND o.order_id IS NULL
            LIMIT 100
        `, [startDate, endDate]);
        
        // Get carts by value range
        const [valueRanges] = await db.query(`
            SELECT 
                CASE 
                    WHEN c.total_cost < 50 THEN 'Under $50'
                    WHEN c.total_cost < 100 THEN '$50-$100'
                    WHEN c.total_cost < 200 THEN '$100-$200'
                    WHEN c.total_cost < 500 THEN '$200-$500'
                    ELSE 'Over $500'
                END as value_range,
                COUNT(*) as count
            FROM carts c
            WHERE c.total_cost > 0
            GROUP BY value_range
            ORDER BY MIN(c.total_cost)
        `);
        
        return {
            totalCarts,
            convertedCarts,
            abandonedCarts,
            conversionRate: parseFloat(conversionRate),
            averageCartValue: avgCartValue,
            averageItemsPerCart: avgItemsPerCart,
            totalCartValue: parseFloat(stats.total_cart_value) || 0,
            valueRanges: valueRanges || [],
            abandonedCartsSample: abandonedCartsData || []
        };
    } catch (err) {
        console.error('Error in getCartAnalytics:', err);
        throw new Error('Failed to fetch cart analytics');
    }
}

module.exports = {
    getUserCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartAnalytics
};

