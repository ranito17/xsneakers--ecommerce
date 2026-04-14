const Order = require('../models/Order');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const Settings = require('../models/Settings');
const emailService = require('../services/emailService');
const pdfService = require('../services/pdfService');
const {
    validatePlaceOrderPayload,
    validateOrderIdParam,
    validateUpdateOrderStatusPayload
} = require('../validation/orderValidator');
const placeOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                data: null
            });
        }

        // Prevent admins from placing orders
        if (req.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins cannot place orders',
                data: null
            });
        }

        const { address, items, delivery_cost = 0 } = req.body;

        // Backend validation
        const validation = validatePlaceOrderPayload({ address, items });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data',
                errors: validation.errors,
                data: null
            });
        }

        // Trusted payload built by backend
        const orderData = {
            user_id: req.user.id,
            address,
            items,
            delivery_cost: Number(delivery_cost) || 0,
            payment_status: 'pending'
        };

        const result = await Order.placeOrder(orderData);

        // Get settings for email / receipt values
        const settings = await Settings.getSettings();

        // Get full order details after creation
        const orderDetails = await Order.getOrderById(result.orderId);

        if (!orderDetails) {
            throw new Error('Order created but could not retrieve order details');
        }

        // Use backend-calculated amounts, not frontend values
        const baseAmount = Number(result.subtotal || 0);
        const deliveryCost = Number(result.delivery_cost || 0);
        const taxRate = parseFloat(settings.tax_rate) || 0;
        const taxAmount = baseAmount * (taxRate / 100);
        const totalWithTax = baseAmount + taxAmount;
        const finalTotal = baseAmount + deliveryCost;

        const emailOrderData = {
            ...orderDetails,
            base_amount: baseAmount,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_with_tax: totalWithTax,
            delivery_cost: deliveryCost,
            final_total: finalTotal,
            free_delivery_threshold: parseFloat(settings.free_delivery_threshold) || 0,
            default_delivery_cost: parseFloat(settings.default_delivery_cost) || 0,
            currency: settings.currency || 'ILS'
        };

        // Send confirmation email, but do not fail the order if email fails
        try {
            await emailService.sendOrderConfirmationEmail(req.user.email, emailOrderData);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await User.getUserOrders(userId);

        res.status(200).json({
            success: true,
            message: 'User orders retrieved successfully',
            data: orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};
const getMyOrderCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await User.getUserOrderCount(userId);

        res.status(200).json({
            success: true,
            message: 'User order count retrieved successfully',
            data: count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getUserOrderCountByAdmin = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (Number.isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID',
                data: null
            });
        }

        const count = await User.getUserOrderCount(userId);

        res.status(200).json({
            success: true,
            message: 'User order count retrieved successfully',
            data: count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.status(200).json({
            success: true,
            message: 'All orders retrieved successfully',
            data: orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
}

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        const isAdmin = req.user.role === 'admin';

        let order;

        if (isAdmin) {
            order = await Order.getOrderById(orderId);
        } else {
            order = await Order.getUserOrderById(orderId, req.user.id);
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or access denied',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const orderIdValidation = validateOrderIdParam(req.params.id);
        if (!orderIdValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: orderIdValidation.errors
            });
        }

        const payloadValidation = validateUpdateOrderStatusPayload(req.body);
        if (!payloadValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: payloadValidation.errors
            });
        }

        const result = await Order.updateOrderStatus(orderIdValidation.sanitized, payloadValidation.sanitizedData.status);
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

// מחיקת הזמנות אינה מותרת להגנת נתונים פיננסיים
// הזמנות חייבות להישמר למטרות חשבונאות, משפטיות וביקורת


const getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.id;

        const isAdmin = req.user.role === 'admin';

        let order;

        if (isAdmin) {
            order = await Order.getOrderById(orderId);
        } else {
            order = await Order.getUserOrderById(orderId, req.user.id);
        }

        if (!order) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                data: null
            });
        }

        const items = await Order.getOrderItems(orderId);

        res.status(200).json({
            success: true,
            message: 'Order items retrieved successfully',
            data: items
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const orders = await Order.getOrdersByStatus(status);
        res.status(200).json({
            success: true,
            message: `Orders with status '${status}' retrieved successfully`,
            data: orders
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};


// בקרי אנליטיקס משופרים
const getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const revenueData = await Analytics.getRevenueAnalytics(startDate, endDate, groupBy);

        res.status(200).json({
            success: true,
            message: 'Revenue analytics retrieved successfully',
            data: revenueData
        });
    } catch (err) {
        console.error('❌ Revenue Analytics Error:', err);
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getProductAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const productData = await Analytics.getProductAnalytics(startDate, endDate);
        const productMetrics = await Analytics.getProductMetrics(startDate, endDate);
        
        res.status(200).json({
            success: true,
            message: 'Product analytics retrieved successfully',
            data: {
                ...productData,
                metrics: productMetrics
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};



const getOrderStatusAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const statusData = await Analytics.getOrderStatusAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'Order status analytics retrieved successfully',
            data: statusData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};



const getBestSellers = async (req, res) => {
    try {
        // בדיקת פרמטר limit ב-query
        // אם 'all' מועבר, הגדרת limit ל-null לקבלת כל התוצאות (ללא LIMIT)
        // אם מספר מועבר, שימוש ב-limit זה
        // אחרת, שימוש ב-undefined להפעלת ברירת מחדל (limit מוגדר מהגדרות)
        let limit = undefined;
        if (req.query.limit === 'all') {
            limit = null; // null means no limit (get all)
        } else if (req.query.limit) {
            limit = parseInt(req.query.limit);
            if (isNaN(limit)) {
                limit = undefined; // מספר לא תקין, שימוש בברירת מחדל
            }
        }
        // אם req.query.limit לא סופק, limit נשאר undefined (שימוש בברירת מחדל)
        
        const bestSellers = await Analytics.getBestSellers(limit);
        res.status(200).json({
            success: true,
            message: 'Best sellers retrieved successfully',
            data: bestSellers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

/**
 * Get user analytics for the specified date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        const userData = await Analytics.getUserAnalytics(startDate, endDate);
        
        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error in getUserAnalytics controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user analytics',
            error: error.message
        });
    }
};

const getProductSizeAnalytics = async (req, res) => {
    try {
        const { productId } = req.params;
        const { startDate, endDate } = req.query;
   

        const sizeData = await Analytics.getProductSizeAnalytics(productId, startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'Product size analytics retrieved successfully',
            data: sizeData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

// generateOrderReceiptPDF - יוצר PDF קבלה להזמנה
// שליחה לשרת: GET /api/orderRoutes/:orderId/receipt
// תגובה מהשרת: PDF Buffer או שגיאה
const generateOrderReceiptPDF = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
      

        // קבלת פרטי הזמנה
        const order = await Order.getUserOrderById(orderId, userId);
          
        

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                data: null
            });
        }

        // קבלת פריטי הזמנה
        const orderItems = await Order.getOrderItems(orderId);

        // קבלת פרטי משתמש (כולל טלפון)
        const user = await User.findUserByEmail(order.customer_email);
        const phoneNumber = user?.phone_number || null;

        // קבלת הגדרות למטבע
        const settings = await Settings.getSettings();
        const currency = settings.currency || 'ILS';

        // חישוב סכומים
        const baseAmount = parseFloat(order.total_amount || 0);
        const taxRate = parseFloat(settings.tax_rate) || 0;
        const taxAmount = baseAmount * (taxRate / 100);
        
        // קבלת עלות משלוח מה-order (אם קיים) או חישוב
        let deliveryCost = 0;
        if (order.delivery_cost !== undefined && order.delivery_cost !== null) {
            deliveryCost = parseFloat(order.delivery_cost);
        }

        // הכנת נתונים ל-PDF
        const pdfData = {
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            phone_number: phoneNumber,
            address: order.shipping_address,
            items: orderItems.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                product_price: parseFloat(item.product_price || 0),
                quantity: item.quantity,
                selected_size: item.selected_size
            })),
            base_amount: baseAmount,
            tax_amount: taxAmount,
            delivery_cost: deliveryCost,
            total_amount: baseAmount + deliveryCost,
            payment_method: order.payment_status === 'paid' ? 'credit-card' : order.payment_status,
            created_at: order.created_at,
            currency: currency
        };

        // יצירת PDF
        const pdfBuffer = await pdfService.generateOrderReceipt(pdfData);

        // שליחת PDF כ-response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.order_number}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (err) {
        console.error('Error generating PDF receipt:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to generate PDF receipt',
            data: null
        });
    }
};

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getMyOrderCount,
    getUserOrderCountByAdmin,
    getOrderItems,
    getOrdersByStatus,
    getRevenueAnalytics,
    getProductAnalytics,
    getOrderStatusAnalytics,
    getBestSellers,
    getUserAnalytics,
    getProductSizeAnalytics,
    generateOrderReceiptPDF
};