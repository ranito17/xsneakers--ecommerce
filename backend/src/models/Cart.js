const dbSingleton = require('../config/database');

// Get user's complete cart with product details
async function getUserCart(userId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // First, get or create user's cart
        let [cartRows] = await db.query(
            'SELECT * FROM carts WHERE user_id = ?',
            [userId]
        );
        
        let cart;
        if (cartRows.length === 0) {
            // Create new cart for user
            const [result] = await db.query(
                'INSERT INTO carts (user_id, total_cost) VALUES (?, 0.00)',
                [userId]
            );
            cart = {
                cart_id: result.insertId,
                user_id: userId,
                total_cost: 0.00,
                created_at: new Date()
            };
        } else {
            cart = cartRows[0];
        }
        
        // Get cart items with product details
        const [itemsRows] = await db.query(`
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                p.id as product_id,
                p.name as product_name,
                p.description,
                p.price,
                p.image_urls,
                p.stock_quantity,
                ci.selected_color,
                ci.selected_size
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cart.cart_id]);
        
        return {
            cart: cart,
            items: itemsRows
        };
    } catch (err) {
        console.error('Database error in getUserCart:', err);
        throw new Error('Failed to fetch user cart from database');
    }
}

// Add item to user's cart
async function addToCart(userId, productId, quantity = 1, selectedSize, selectedColor) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Get user's cart
        let [cartRows] = await db.query(
            'SELECT * FROM carts WHERE user_id = ?',
            [userId]
        );
        
        let cartId;
        if (cartRows.length === 0) {
            // Create new cart
            const [result] = await db.query(
                'INSERT INTO carts (user_id, total_cost) VALUES (?, 0.00)',
                [userId]
            );
            cartId = result.insertId;
        } else {
            cartId = cartRows[0].cart_id;
        }
        
        // Check if item already exists in cart
        const [existingItems] = await db.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );
        
        if (existingItems.length > 0) {
            // Update existing item quantity
            await db.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?',
                [quantity, existingItems[0].cart_item_id]
            );
        } else {
            // Get product price
            const [productRows] = await db.query(
                'SELECT price FROM products WHERE id = ?',
                [productId]
            );
            
            if (productRows.length === 0) {
                throw new Error('Product not found');
            }
            
            // Add new item to cart
            await db.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity, selected_size, selected_color) VALUES (?, ?, ?, ?, ?)',
                [cartId, productId, quantity, selectedSize, selectedColor]
            );
        }
        
        // Update cart total
        await updateCartTotal(cartId);
        
        return { success: true, message: 'Item added to cart' };
    } catch (err) {
        console.error('Database error in addToCart:', err);
        throw new Error('Failed to add item to cart');
    }
}

// Update cart total
async function updateCartTotal(cartId) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [result] = await db.query(`
            UPDATE carts 
            SET total_cost = (
                SELECT SUM(ci.quantity * p.price) 
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.cart_id = ?
            )
            WHERE cart_id = ?
        `, [cartId, cartId]);
        
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Database error in updateCartTotal:', err);
        throw new Error('Failed to update cart total');
    }
}

// Update item quantity in cart
async function updateQuantity(userId, cartItemId, quantity) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Get user's cart
        const [cartRows] = await db.query(
            'SELECT cart_id FROM carts WHERE user_id = ?',
            [userId]
        );
        
        if (cartRows.length === 0) {
            throw new Error('Cart not found');
        }
        
        // Update item quantity
        await db.query(
            'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ? AND cart_id = ?',
            [quantity, cartItemId, cartRows[0].cart_id]
        );
        
        // Update cart total
        await updateCartTotal(cartRows[0].cart_id);
        
        return { success: true, message: 'Item quantity updated' };
    } catch (err) {
        console.error('Database error in updateQuantity:', err);
        throw new Error('Failed to update item quantity');
    }
}

// Remove item from cart
async function removeFromCart(userId, cartItemId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Get user's cart
        const [cartRows] = await db.query(
            'SELECT cart_id FROM carts WHERE user_id = ?',
            [userId]
        );
        
        if (cartRows.length === 0) {
            throw new Error('Cart not found');
        }
        
        // Remove item
        await db.query(
            'DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?',
            [cartItemId, cartRows[0].cart_id]
        );
        
        // Update cart total
        await updateCartTotal(cartRows[0].cart_id);
        
        return { success: true, message: 'Item removed from cart' };
    } catch (err) {
        console.error('Database error in removeFromCart:', err);
        throw new Error('Failed to remove item from cart');
    }
}

// Clear entire cart
async function clearCart(userId) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Get user's cart
        const [cartRows] = await db.query(
            'SELECT cart_id FROM carts WHERE user_id = ?',
            [userId]
        );
        
        if (cartRows.length === 0) {
            return { success: true, message: 'Cart already empty' };
        }
        
        // Remove all items
        await db.query(
            'DELETE FROM cart_items WHERE cart_id = ?',
            [cartRows[0].cart_id]
        );
        
        // Reset cart total
        await db.query(
            'UPDATE carts SET total_cost = 0.00 WHERE cart_id = ?',
            [cartRows[0].cart_id]
        );
        
        return { success: true, message: 'Cart cleared' };
    } catch (err) {
        console.error('Database error in clearCart:', err);
        throw new Error('Failed to clear cart');
    }
}

module.exports = {  
    getUserCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateCartTotal
};


