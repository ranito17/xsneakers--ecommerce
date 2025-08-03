const dbSingleton = require('../config/database');
async function placeOrder(orderData) {
    try {
        const db = await dbSingleton.getConnection();
        const { user_id, total_amount, payment_status, items } = orderData;

        // Generate order number (ORD-YYYY-XXX format)
        const currentYear = new Date().getFullYear();
        
        // Get the highest order number for this year
        const [lastOrder] = await db.query(
            'SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY order_number DESC LIMIT 1',
            [`ORD-${currentYear}-%`]
        );
        
        let orderNumber;
        if (lastOrder.length > 0) {
            // Extract the number from the last order number and increment
            const lastOrderNumber = lastOrder[0].order_number;
            const parts = lastOrderNumber.split('-');
            if (parts.length === 3) {
                const lastNumber = parseInt(parts[2]);
                if (!isNaN(lastNumber)) {
                    orderNumber = `ORD-${currentYear}-${String(lastNumber + 1).padStart(3, '0')}`;
                } else {
                    // Fallback if parsing fails
                    orderNumber = `ORD-${currentYear}-001`;
                }
            } else {
                // Fallback if format is wrong
                orderNumber = `ORD-${currentYear}-001`;
            }
        } else {
            // First order of the year
            orderNumber = `ORD-${currentYear}-001`;
        }

        // Calculate estimated delivery date (1 month from today)
        const estimatedDelivery = new Date();
        estimatedDelivery.setMonth(estimatedDelivery.getMonth() + 1);

        // Insert order with new columns including estimated delivery
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_amount, payment_status, order_number, status, arrival_date_estimated) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, total_amount, payment_status, orderNumber, 'pending', estimatedDelivery]
        );
        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of items) {
            const { product_id, quantity, selected_color, selected_size } = item;
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, selected_color, selected_size) VALUES (?, ?, ?, ?, ?)',
                [orderId, product_id, quantity, selected_color, selected_size]
            );
        }
        
        // Return the order with the generated order number
        return { ...orderResult, orderNumber };
    } catch (err) {
        console.error('Database error in placeOrder:', err);
        throw new Error('Failed to place order');
    }
}
async function getAllOrders() {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.payment_status,
                o.order_number,
                o.status,
                o.arrival_date_estimated,
                o.created_at,
                o.updated_at,
                u.full_name as customer_name,
                u.email as customer_email,
                u.address as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        return rows;
    } catch (err) {
        console.error('Database error in getAllOrders:', err);
        throw new Error('Failed to fetch orders');
    }
}
async function getOrderById(orderId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.payment_status,
                o.order_number,
                o.status,
                o.arrival_date_estimated,
                o.created_at,
                o.updated_at,
                u.full_name as customer_name,
                u.email as customer_email,
                u.address as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_id = ?
        `, [orderId]);
        return rows[0];
    } catch (err) {
        console.error('Database error in getOrderById:', err);
        throw new Error('Failed to fetch order by ID');
    }
}

async function getUserOrderById(orderId, userId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.payment_status,
                o.order_number,
                o.status,
                o.arrival_date_estimated,
                o.created_at,
                u.full_name as customer_name,
                u.email as customer_email,
                u.address as shipping_address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_id = ? AND o.user_id = ?
        `, [orderId, userId]);
        return rows[0];
    } catch (err) {
        console.error('Database error in getUserOrderById:', err);
        throw new Error('Failed to fetch user order by ID');
    }
}
async function updateOrder(orderId, orderData) {
    try {
        const db = await dbSingleton.getConnection();
        const { total_amount, status, tracking_number } = orderData;
        const [result] = await db.query(
            'UPDATE orders SET total_amount = ?, status = ?, tracking_number = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [total_amount, status, tracking_number, orderId]
        );
        return result;
    } catch (err) {
        console.error('Database error in updateOrder:', err);
        throw new Error('Failed to update order');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const db = await dbSingleton.getConnection();
        const [result] = await db.query(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [status, orderId]
        );
        return result;
    } catch (err) {
        console.error('Database error in updateOrderStatus:', err);
        throw new Error('Failed to update order status');
    }
}
async function deleteOrder(orderId) {
    try {
        const db = await dbSingleton.getConnection();
        const [result] = await db.query('DELETE FROM orders WHERE order_id = ?', [orderId]);
        return result;
    } catch (err) {
        console.error('Database error in deleteOrder:', err);
        throw new Error('Failed to delete order');
    }
}
async function getUserOrders(userId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                order_id,
                user_id,
                total_amount,
                payment_status,
                order_number,
                status,
                arrival_date_estimated,
                created_at
            FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);
        return rows;
    } catch (err) {
        console.error('Database error in getUserOrders:', err);
        throw new Error('Failed to fetch user orders');
    }
}
async function getOrderItems(orderId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                oi.*,
                p.name as product_name,
                p.price as product_price,
                p.image_urls as product_images,
                p.description as product_description
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        // Process image URLs to convert to full URLs
        const processedRows = rows.map(item => {
            let images = [];
            
            // Check if product_images exists and has content
            if (item.product_images && item.product_images.trim()) {
                images = item.product_images.split(',').map(url => url.trim()).filter(Boolean);
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
                ...item,
                product_images: fullImageUrls.join(',')
            };
        });
        
        return processedRows;
    } catch (err) {
        console.error('Database error in getOrderItems:', err);
        throw new Error('Failed to fetch order items');
    }
}
module.exports = {  
    placeOrder,
    getAllOrders,
    getOrderById,
    getUserOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getUserOrders,
    getOrderItems
};
