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
// Order deletion is not allowed for financial data protection
// Orders must be preserved for accounting, legal, and audit purposes
async function deleteOrder(orderId) {
    throw new Error('Order deletion is not allowed. Financial data must be preserved.');
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

// Dashboard Analytics Functions
async function getDashboardStats() {
    try {
        const db = await dbSingleton.getConnection();
        
        // Total orders and revenue
        const [orderStats] = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
                COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
            FROM orders
        `);

        // Recent orders with customer info
        const [recentOrders] = await db.query(`
            SELECT 
                o.order_id,
                o.order_number,
                o.total_amount,
                o.status,
                o.created_at,
                u.full_name as customer_name,
                u.address as customer_address,
                u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `);

        // Top selling products
        const [topProducts] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                COUNT(oi.order_id) as order_count,
                SUM(oi.quantity) as total_quantity_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status != 'cancelled' OR o.status IS NULL
            GROUP BY p.id
            ORDER BY total_quantity_sold DESC
            LIMIT 5
        `);

        // Monthly revenue for the last 6 months
        const [monthlyRevenue] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total_amount) as revenue,
                COUNT(*) as order_count
            FROM orders
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            AND status != 'cancelled'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        `);

        return {
            orderStats: orderStats[0],
            recentOrders,
            topProducts,
            monthlyRevenue
        };
    } catch (err) {
        console.error('Database error in getDashboardStats:', err);
        throw new Error('Failed to fetch dashboard statistics');
    }
}

async function getOrdersByStatus(status) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                o.order_id,
                o.order_number,
                o.total_amount,
                o.status,
                o.created_at,
                u.full_name as customer_name,
                u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.status = ?
            ORDER BY o.created_at DESC
        `, [status]);
        return rows;
    } catch (err) {
        console.error('Database error in getOrdersByStatus:', err);
        throw new Error('Failed to fetch orders by status');
    }
}

// Enhanced Analytics Functions
async function getRevenueAnalytics(startDate, endDate, groupBy = 'day') {
    try {
        const db = await dbSingleton.getConnection();
        
        let dateFormat, groupByClause;
        
        switch (groupBy) {
            case 'day':
                dateFormat = '%Y-%m-%d';
                groupByClause = 'DATE(created_at)';
                break;
            case 'week':
                dateFormat = '%Y-%u';
                groupByClause = 'YEARWEEK(created_at)';
                break;
            case 'month':
                dateFormat = '%Y-%m';
                groupByClause = 'DATE_FORMAT(created_at, "%Y-%m")';
                break;
            case 'year':
                dateFormat = '%Y';
                groupByClause = 'YEAR(created_at)';
                break;
            default:
                dateFormat = '%Y-%m-%d';
                groupByClause = 'DATE(created_at)';
        }

        const [revenueData] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, ?) as period,
                SUM(total_amount) as revenue,
                COUNT(*) as order_count,
                AVG(total_amount) as avg_order_value
            FROM orders
            WHERE created_at BETWEEN ? AND ?
            AND status != 'cancelled'
            GROUP BY ${groupByClause}
            ORDER BY period ASC
        `, [dateFormat, startDate, endDate]);

        return revenueData;
    } catch (err) {
        console.error('Database error in getRevenueAnalytics:', err);
        throw new Error('Failed to fetch revenue analytics');
    }
}

async function getProductAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Product performance analytics
        const [productPerformance] = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.stock_quantity,
                COUNT(oi.order_id) as total_orders,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue,
                AVG(oi.quantity) as avg_quantity_per_order,
                (p.stock_quantity - COALESCE(SUM(oi.quantity), 0)) as remaining_stock
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY total_revenue DESC
        `, [startDate, endDate]);

        // Product category performance
        const [categoryPerformance] = await db.query(`
            SELECT 
                c.category_name,
                COUNT(DISTINCT o.order_id) as total_orders,
                SUM(oi.quantity) as total_quantity_sold,
                SUM(oi.quantity * p.price) as total_revenue
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.order_id
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY c.category_id
            ORDER BY total_revenue DESC
        `, [startDate, endDate]);

        return {
            productPerformance,
            categoryPerformance
        };
    } catch (err) {
        console.error('Database error in getProductAnalytics:', err);
        throw new Error('Failed to fetch product analytics');
    }
}

async function getUserAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // User registration trends
        const [userGrowth] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                COUNT(*) as new_users
            FROM users
            WHERE created_at BETWEEN ? AND ?
            AND role = 'customer'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [startDate, endDate]);

        // Customer order frequency
        const [customerSegments] = await db.query(`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                COUNT(o.order_id) as total_orders,
                SUM(o.total_amount) as total_spent,
                AVG(o.total_amount) as avg_order_value,
                MAX(o.created_at) as last_order_date
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            AND o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY total_spent DESC
            LIMIT 20
        `, [startDate, endDate]);

        // Top customers by revenue
        const [topCustomers] = await db.query(`
            SELECT 
                u.full_name,
                u.email,
                COUNT(o.order_id) as order_count,
                SUM(o.total_amount) as total_revenue
            FROM users u
            JOIN orders o ON u.id = o.user_id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            AND u.role = 'customer'
            GROUP BY u.id
            ORDER BY total_revenue DESC
            LIMIT 10
        `, [startDate, endDate]);

        return {
            userGrowth,
            customerSegments,
            topCustomers
        };
    } catch (err) {
        console.error('Database error in getUserAnalytics:', err);
        throw new Error('Failed to fetch user analytics');
    }
}

async function getProfitAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Assuming we have cost data in products table (cost_price field)
        // If not, we'll calculate based on estimated margins
        const [profitData] = await db.query(`
            SELECT 
                DATE_FORMAT(o.created_at, '%Y-%m-%d') as date,
                SUM(o.total_amount) as revenue,
                COUNT(o.order_id) as order_count,
                AVG(o.total_amount) as avg_order_value
            FROM orders o
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            GROUP BY DATE(o.created_at)
            ORDER BY date ASC
        `, [startDate, endDate]);

        // Calculate estimated profit (assuming 30% margin for demonstration)
        const profitDataWithMargin = profitData.map(item => ({
            ...item,
            estimated_profit: item.revenue * 0.3,
            profit_margin_percentage: 30
        }));

        return profitDataWithMargin;
    } catch (err) {
        console.error('Database error in getProfitAnalytics:', err);
        throw new Error('Failed to fetch profit analytics');
    }
}

async function getOrderStatusAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        const [statusDistribution] = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(total_amount) as total_revenue
            FROM orders
            WHERE created_at BETWEEN ? AND ?
            GROUP BY status
            ORDER BY count DESC
        `, [startDate, endDate]);

        return statusDistribution;
    } catch (err) {
        console.error('Database error in getOrderStatusAnalytics:', err);
        throw new Error('Failed to fetch order status analytics');
    }
}

async function getGeographicAnalytics(startDate, endDate) {
    try {
        const db = await dbSingleton.getConnection();
        
        // Analyze orders by customer location (using address field)
        const [locationData] = await db.query(`
            SELECT 
                u.address,
                COUNT(o.order_id) as order_count,
                SUM(o.total_amount) as total_revenue
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.created_at BETWEEN ? AND ?
            AND o.status != 'cancelled'
            AND u.address IS NOT NULL
            GROUP BY u.address
            ORDER BY total_revenue DESC
            LIMIT 10
        `, [startDate, endDate]);

        return locationData;
    } catch (err) {
        console.error('Database error in getGeographicAnalytics:', err);
        throw new Error('Failed to fetch geographic analytics');
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
    getOrderItems,
    getDashboardStats,
    getOrdersByStatus,
    getRevenueAnalytics,
    getProductAnalytics,
    getUserAnalytics,
    getProfitAnalytics,
    getOrderStatusAnalytics,
    getGeographicAnalytics
};
