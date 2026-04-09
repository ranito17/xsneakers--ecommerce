const paypalService = require('../services/paypalService');
const Order = require('../models/Order');
const { validatePlaceOrderPayload } = require('../validation/orderValidator');

// יצירת הזמנת PayPal
// POST /api/payments/paypal/create-order
const createPayPalOrder = async (req, res) => {
    try {
        const { amount, currency, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // עיגול הסכום ל-2 ספרות עשרוניות
        const roundedAmount = parseFloat(amount);
        if (isNaN(roundedAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount format'
            });
        }
        
        const orderData = {
            amount: roundedAmount,
            currency: currency || 'ILS',
            description: description || 'Order payment'
        };

        const result = await paypalService.createOrder(orderData);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to create PayPal order'
            });
        }

        res.json({
            success: true,
            orderId: result.orderId,
            status: result.status,
            demo: !!result.demo
        });
    } catch (error) {
        console.error('Create PayPal order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// לכידת תשלום PayPal + יצירת הזמנה רק אחרי אימות/לכידה
// POST /api/payments/paypal/capture-order
const capturePayPalOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Prevent admins from placing orders
        if (req.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admins cannot place orders'
            });
        }

        const { orderId, address, items, delivery_cost = 0 } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'PayPal order ID is required'
            });
        }

        // Validate order payload (do not trust frontend beyond shape)
        const validation = validatePlaceOrderPayload({ address, items });
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data',
                errors: validation.errors
            });
        }

        // לכידת תשלום PayPal
        const captureResult = await paypalService.captureOrder(orderId);

        if (!captureResult.success) {
            return res.status(400).json({
                success: false,
                message: captureResult.error || 'Failed to capture PayPal payment'
            });
        }

        // בדיקה אם התשלום הצליח
        if (captureResult.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: `Payment status: ${captureResult.status}`
            });
        }

        // Create store order only after verified capture
        const orderData = {
            user_id: req.user.id,
            address,
            items,
            delivery_cost: Number(delivery_cost) || 0,
            payment_status: 'paid'
        };

        const orderResult = await Order.placeOrder(orderData);

        res.json({
            success: true,
            message: 'Payment captured and order created successfully',
            transactionId: captureResult.transactionId,
            status: captureResult.status,
            demo: !!captureResult.demo,
            orderId: orderResult.orderId,
            orderNumber: orderResult.order_number
        });
    } catch (error) {
        console.error('Capture PayPal order error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createPayPalOrder,
    capturePayPalOrder
};

