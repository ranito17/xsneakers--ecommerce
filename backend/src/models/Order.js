const dbSingleton = require('../config/database');
const Activity = require('./Activity');
const { ACTION_TYPES, ENTITY_TYPES } = require('../middleware/activityLogger');
const { normalizeImageUrls, imageUrlsToString } = require('../utils/image');
// פונקציית לקוח: יצירת הזמנה חדשה (כולל בדיקות מלאי)
async function placeOrder(orderData) {
    const db = await dbSingleton.getDedicatedConnection();
    const Product = require('./Product');

    try {
        const {
            user_id,
            items,
            address,
            delivery_cost = 0,
            payment_status = 'pending'
        } = orderData;

        if (!user_id) {
            throw new Error('User ID is required');
        }

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Order must include at least one item');
        }

        if (!address || typeof address !== 'object') {
            throw new Error('Valid address is required');
        }

        await db.beginTransaction();

        let calculatedSubtotal = 0;

        // Validate items, stock, and calculate total from DB prices
        for (const item of items) {
            const { product_id, quantity, selected_size } = item;

            if (!product_id) {
                throw new Error('Product ID is required for each item');
            }

            const qty = Number(quantity);
            if (!Number.isInteger(qty) || qty <= 0) {
                throw new Error(`Invalid quantity for product ${product_id}`);
            }

            if (!selected_size) {
                throw new Error(`Selected size is required for product ${product_id}`);
            }

            const product = await Product.getProductById(product_id, db);

            if (!product) {
                throw new Error(`Product not found: ${product_id}`);
            }

            const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
            const sizeData = productSizes.find(
                (size) => String(size.size) === String(selected_size)
            );

            if (!sizeData) {
                throw new Error(`Selected size not available for product ${product.name}`);
            }

            if (Number(sizeData.quantity) < qty) {
                throw new Error(
                    `Insufficient stock for product ${product.name}, size ${selected_size}`
                );
            }

            calculatedSubtotal += Number(product.price) * qty;
        }

        const safeDeliveryCost = Number(delivery_cost) || 0;
        const total_amount = calculatedSubtotal + safeDeliveryCost;

        // Generate order number
        const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Insert order
        const [orderResult] = await db.query(
            `INSERT INTO orders 
            (user_id, total_amount, payment_status, order_number, status, address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                user_id,
                total_amount,
                payment_status,
                order_number,
                'pending',
                JSON.stringify(address)
            ]
        );

        const orderId = orderResult.insertId;

        // Insert order items + reduce stock
        for (const item of items) {
            const { product_id, quantity, selected_size } = item;

            const product = await Product.getProductById(product_id, db);
            const qty = Number(quantity);

            await db.query(
                `INSERT INTO order_items
                (order_id, product_id, quantity, selected_size)
                VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    product_id,
                    qty,
                    selected_size
                ]
            );

            const stockReduced = await Product.decreaseStockForSize(
                product_id,
                selected_size,
                qty,
                db
            );

            if (!stockReduced) {
                throw new Error(
                    `Failed to reduce stock for product ${product.name}, size ${selected_size}`
                );
            }
        }

        await db.commit();

        return {
            success: true,
            orderId,
            order_number,
            total_amount,
            subtotal: calculatedSubtotal,
            delivery_cost: safeDeliveryCost
        };
    } catch (err) {
        try {
            await db.rollback();
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        throw err;
    } finally {
        try {
            await db.release();
        } catch (closeError) {
            // Swallow close errors to preserve existing behavior
        }
    }
}
async function getAllOrders(sizeFilter = null) {
    try {
        const db = await dbSingleton.getConnection();
        
        let query = `
            SELECT DISTINCT
                o.order_id,
                o.user_id,
                o.total_amount,
                o.payment_status,
                o.order_number,
                o.status,
                o.arrival_date_estimated,
                o.created_at,
                o.updated_at,
                o.address as shipping_address,
                u.full_name as customer_name,
                u.email as customer_email,
                COALESCE(SUM(oi.quantity), 0) as total_items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
        `;
        
        const params = [];
        
        // הוספת סינון גדל אם סופק
        if (sizeFilter && sizeFilter !== 'all') {
            query += ` WHERE oi.selected_size = ?`;
            params.push(sizeFilter);
        }
        
        query += ` GROUP BY o.order_id, o.user_id, o.total_amount, o.payment_status, o.order_number, o.status, o.arrival_date_estimated, o.created_at, o.updated_at, o.address, u.full_name, u.email ORDER BY o.created_at DESC`;
        
        const [rows] = await db.query(query, params);
        
        // פענוח כתובת JSON לכל הזמנה
        return rows.map(order => {
            if (order.shipping_address) {
                try {
                    order.shipping_address = typeof order.shipping_address === 'string' 
                        ? JSON.parse(order.shipping_address) 
                        : order.shipping_address;
                } catch (e) {
                    console.error('Error parsing address:', e);
                }
            }
            return order;
        });
    } catch (err) {
        throw new Error('Failed to fetch orders');
    }
}

// קבלת כל הגדלים הייחודיים מפריטי הזמנות
// פונקציה זו הוסרה - לא בשימוש
// async function getOrderSizes() { ... }
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
                o.address as shipping_address,
                u.full_name as customer_name,
                u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_id = ?
        `, [orderId]);
        
        // פענוח כתובת JSON אם קיימת
        const order = rows[0];
        if (order && order.shipping_address) {
            try {
                order.shipping_address = typeof order.shipping_address === 'string' 
                    ? JSON.parse(order.shipping_address) 
                    : order.shipping_address;
            } catch (e) {
                console.error('Error parsing address:', e);
            }
        }
        return order;
    } catch (err) {
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
                o.address as shipping_address,
                u.full_name as customer_name,
                u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.order_id = ? AND o.user_id = ?
        `, [orderId, userId]);
        
        // פענוח כתובת JSON אם קיימת
        const order = rows[0];
        if (order && order.shipping_address) {
            try {
                order.shipping_address = typeof order.shipping_address === 'string' 
                    ? JSON.parse(order.shipping_address) 
                    : order.shipping_address;
            } catch (e) {
                console.error('Error parsing address:', e);
            }
        }
        return order;
    } catch (err) {
        throw new Error('Failed to fetch user order by ID');
    }
}
// פונקציה זו הוסרה - לא בשימוש
// async function updateOrder(orderId, orderData) { ... }

/**
 * מעדכן את סטטוס ההזמנה
 * אם הסטטוס משתנה ל-"cancelled", מחזיר את המלאי של כל הפריטים בהזמנה
 * 
 * @param {number} orderId - ID של ההזמנה
 * @param {string} status - הסטטוס החדש
 * @returns {Promise<Object>} תוצאת ה-update
 */
async function updateOrderStatus(orderId, status) {
    let db;
    try {
        db = await dbSingleton.getDedicatedConnection();
        const Product = require('./Product');
        await db.beginTransaction();
        
        // קבלת הסטטוס הקודם
        const [currentOrder] = await db.query(
            'SELECT status FROM orders WHERE order_id = ?',
            [orderId]
        );
        
        if (currentOrder.length === 0) {
            throw new Error('Order not found');
        }
        
        const previousStatus = currentOrder[0].status;
        const isCancelling = status === 'cancelled' && previousStatus !== 'cancelled';
        const isUncancelling = previousStatus === 'cancelled' && status !== 'cancelled';
        
        // אם מבטלים הזמנה - החזרת מלאי
        if (isCancelling) {
            // קבלת כל פריטי ההזמנה
            const [orderItems] = await db.query(
                'SELECT product_id, quantity, selected_size FROM order_items WHERE order_id = ?',
                [orderId]
            );
            
            // קבלת פרטי ההזמנה לרישום פעילות
            const [orderInfo] = await db.query(
                'SELECT order_number, user_id FROM orders WHERE order_id = ?',
                [orderId]
            );
            const orderNumber = orderInfo[0]?.order_number || orderId;
            const userId = orderInfo[0]?.user_id || null;
            
            // החזרת המלאי לכל פריט
            for (const item of orderItems) {
                const { product_id, quantity, selected_size } = item;
                if (selected_size) {
                    await Product.increaseStockForSize(product_id, selected_size, quantity, db);
                    
                    // רישום פעילות הגדלת מלאי
                    try {
                        const product = await Product.getProductById(product_id, db);
                        const productName = product ? product.name : `Product ID ${product_id}`;
                        await Activity.create({
                            user_id: userId,
                            action_type: ACTION_TYPES.STOCK_INCREASED,
                            entity_type: ENTITY_TYPES.PRODUCT,
                            entity_id: product_id,
                            description: `Stock increased: ${productName}, Size ${selected_size}, Quantity: ${quantity} (Order #${orderNumber} cancelled)`
                        }, db);
                    } catch (logError) {
                        console.error('Error logging stock increase activity:', logError);
                    }
                }
            }

            // רישום פעילות ביטול הזמנה
            try {
                await Activity.create({
                    user_id: userId,
                    action_type: ACTION_TYPES.ORDER_CANCELLED,
                    entity_type: ENTITY_TYPES.ORDER,
                    entity_id: orderId,
                    description: `Order #${orderNumber} cancelled`
                }, db);
            } catch (logError) {
                console.error('Error logging order cancellation activity:', logError);
            }
        }
        
        // אם מבטלים את הביטול - הפחתת מלאי שוב
        if (isUncancelling) {
            // קבלת כל פריטי ההזמנה
            const [orderItems] = await db.query(
                'SELECT product_id, quantity, selected_size FROM order_items WHERE order_id = ?',
                [orderId]
            );
            
            // קבלת פרטי ההזמנה לרישום פעילות
            const [orderInfo] = await db.query(
                'SELECT order_number, user_id FROM orders WHERE order_id = ?',
                [orderId]
            );
            const orderNumber = orderInfo[0]?.order_number || orderId;
            const userId = orderInfo[0]?.user_id || null;
            
            // הפחתת המלאי לכל פריט
            for (const item of orderItems) {
                const { product_id, quantity, selected_size } = item;
                if (selected_size) {
                    await Product.decreaseStockForSize(product_id, selected_size, quantity, db);
                    
                    // רישום פעילות הפחתת מלאי
                    try {
                        const product = await Product.getProductById(product_id, db);
                        const productName = product ? product.name : `Product ID ${product_id}`;
                        await Activity.create({
                            user_id: userId,
                            action_type: ACTION_TYPES.STOCK_DECREASED,
                            entity_type: ENTITY_TYPES.PRODUCT,
                            entity_id: product_id,
                            description: `Stock decreased: ${productName}, Size ${selected_size}, Quantity: ${quantity} (Order #${orderNumber} uncancelled)`
                        }, db);
                    } catch (logError) {
                        console.error('Error logging stock decrease activity:', logError);
                    }
                }
            }
        }
        
        // עדכון הסטטוס
        const [result] = await db.query(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [status, orderId]
        );
        await db.commit();
        return result;
    } catch (err) {
        if (db) {
            try {
                await db.rollback();
            } catch (rollbackError) {
                // preserve existing behavior
            }
        }
        throw new Error('Failed to update order status');
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
// מחיקת הזמנות אסורה להגנת נתונים פיננסיים
// הזמנות חייבות להישמר למטרות חשבונאות, משפט וביקורת

async function getOrderItems(orderId) {
    try {
        const db = await dbSingleton.getConnection();
        const [rows] = await db.query(`
            SELECT 
                oi.*,
                p.name as product_name,
                p.price as product_price,
                p.image_urls as product_images,
                p.description as product_description,
                CAST(o.address AS CHAR) as shipping_address
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        // עיבוד כתובות תמונות להמרה לכתובות מלאות ופענוח כתובת
        const processedRows = rows.map(item => {
            let images = [];
            
            // בדיקה אם product_images קיים ויש לו תוכן
            if (item.product_images && item.product_images.trim()) {
                images = item.product_images.split(',').map(url => url.trim()).filter(Boolean);
            }
            
            // המרה לכתובות מלאות
            const normalizedImageUrls = normalizeImageUrls(images, 'products');
            
            // פענוח כתובת משלוח JSON אם קיימת
            let shippingAddress = item.shipping_address;
            
            // טיפול בפורמטים שונים של כתובת
            if (shippingAddress) {
                // אם זה Buffer (לפעמים MySQL מחזיר JSON כ-Buffer), המרה למחרוזת
                if (Buffer.isBuffer(shippingAddress)) {
                    shippingAddress = shippingAddress.toString('utf8');
                }
                
                // אם זה מחרוזת, ניסיון לפרסר כ-JSON
                if (typeof shippingAddress === 'string' && shippingAddress.trim()) {
                    try {
                        const parsed = JSON.parse(shippingAddress);
                        shippingAddress = parsed;
                    } catch (e) {
                        // אם הפרסור נכשל, יכול להיות שזה כבר מחרוזת מעוצבת - להשאיר כפי שהיא
                    }
                }
                // אם זה כבר אובייקט, להשתמש ישירות
            }
            
            // הסרת shipping_address מה-spread כדי למנוע התנגשויות
            const { shipping_address: _, ...itemWithoutAddress } = item;
            
            return {
                ...itemWithoutAddress,
                product_images: imageUrlsToString(normalizedImageUrls,'products'),
                shipping_address: shippingAddress || null
            };
        });
        
        return processedRows;
    } catch (err) {
        throw new Error('Failed to fetch order items');
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
        throw new Error('Failed to fetch orders by status');
    }
}


module.exports = {  
    placeOrder,
    getAllOrders,
    getOrderById,
    getUserOrderById,
    updateOrderStatus,
    getOrderItems,
    getOrdersByStatus
};
