const emailService = require('../services/emailService');
const Settings = require('../models/Settings');
const crypto = require('crypto');

// Store fulfillment tokens in memory (in production, use Redis or database)
const fulfillmentTokens = new Map();

// Send stock refuel email to supplier
const sendStockRefuelEmail = async (req, res) => {
    try {
        const { products, notes } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Products array is required and must not be empty'
            });
        }

        // Get supplier information from settings
        const settings = await Settings.getSettings();
        if (!settings || !settings.supplier_email) {
            return res.status(400).json({
                success: false,
                message: 'Supplier email not configured in settings'
            });
        }

        // Generate unique fulfillment token
        const fulfillmentToken = crypto.randomBytes(32).toString('hex');
        
        // Store token with order details (in production, use database)
        fulfillmentTokens.set(fulfillmentToken, {
            products,
            notes,
            requestedAt: new Date(),
            status: 'pending'
        });

        // Send email to supplier
        await emailService.sendStockRefuelEmail({
            supplierEmail: settings.supplier_email,
            supplierName: settings.supplier_name || 'Supplier',
            products,
            fulfillmentToken,
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
        });

        res.json({
            success: true,
            message: 'Stock refuel email sent successfully to supplier',
            data: {
                fulfillmentToken,
                supplierEmail: settings.supplier_email
            }
        });

    } catch (error) {
        console.error('Error sending stock refuel email:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send stock refuel email'
        });
    }
};

// Handle supplier fulfillment confirmation
const handleFulfillment = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Check if token exists and is pending
        const orderData = fulfillmentTokens.get(token);
        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired fulfillment token'
            });
        }

        if (orderData.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order has already been fulfilled or cancelled'
            });
        }

        // Update status to fulfilled
        orderData.status = 'fulfilled';
        orderData.fulfilledAt = new Date();
        fulfillmentTokens.set(token, orderData);

        // Send confirmation email to admin
        const settings = await Settings.getSettings();
        if (settings && settings.email_notification) {
            try {
                await emailService.sendEmail(
                    settings.email_notification,
                    'Supplier Order Fulfilled',
                    `Supplier has confirmed fulfillment of stock refuel order.\n\nProducts:\n${orderData.products.map(p => `- ${p.name}: ${p.quantity} units`).join('\n')}\n\nFulfilled at: ${orderData.fulfilledAt.toLocaleString()}`,
                    `
                    <h2>Supplier Order Fulfilled</h2>
                    <p>Supplier has confirmed fulfillment of stock refuel order.</p>
                    <h3>Products:</h3>
                    <ul>
                        ${orderData.products.map(p => `<li><strong>${p.name}:</strong> ${p.quantity} units</li>`).join('')}
                    </ul>
                    <p><strong>Fulfilled at:</strong> ${orderData.fulfilledAt.toLocaleString()}</p>
                    `
                );
            } catch (emailError) {
                console.error('Error sending admin notification:', emailError);
            }
        }

        // Return success page
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Fulfilled</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9f9f9; }
                    .container { max-width: 600px; margin: 50px auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .success-icon { font-size: 48px; margin-bottom: 20px; }
                    .product-list { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .product-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                    .product-item:last-child { border-bottom: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="success-icon">✅</div>
                        <h1>Order Fulfilled Successfully</h1>
                        <p>Thank you for confirming the fulfillment</p>
                    </div>
                    <div class="content">
                        <p>Your order fulfillment has been confirmed and recorded. The store has been notified of the shipment.</p>
                        
                        <div class="product-list">
                            <h3>Products Fulfilled:</h3>
                            ${orderData.products.map(product => `
                                <div class="product-item">
                                    <span><strong>${product.name}</strong></span>
                                    <span>${product.quantity} units</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <p><strong>Fulfilled at:</strong> ${orderData.fulfilledAt.toLocaleString()}</p>
                        
                        <p>You can close this window now.</p>
                    </div>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Error handling fulfillment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process fulfillment'
        });
    }
};

// Get fulfillment status
const getFulfillmentStatus = async (req, res) => {
    try {
        const { token } = req.params;
        
        const orderData = fulfillmentTokens.get(token);
        if (!orderData) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired fulfillment token'
            });
        }

        res.json({
            success: true,
            data: {
                status: orderData.status,
                products: orderData.products,
                requestedAt: orderData.requestedAt,
                fulfilledAt: orderData.fulfilledAt,
                notes: orderData.notes
            }
        });

    } catch (error) {
        console.error('Error getting fulfillment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get fulfillment status'
        });
    }
};

module.exports = {
    sendStockRefuelEmail,
    handleFulfillment,
    getFulfillmentStatus
};
