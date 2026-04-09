const paypal = require('@paypal/checkout-server-sdk');

/**
 * PayPal Service
 * Handles PayPal order creation and payment capture
 */

// Configure PayPal environment
function environment() {
    // Ensure dotenv is loaded
    require('dotenv').config();
    
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    // Debug logging (only in development)
    if (process.env.NODE_ENV !== 'production') {
        console.log('PayPal Config:', {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            mode: mode,
            clientIdLength: clientId?.length || 0
        });
    }

    // In demo/portfolio mode we allow the app to run without PayPal credentials.
    // createOrder/captureOrder will return a simulated success response in that case.
    if (!clientId || !clientSecret) {
        return null;
    }

    if (mode === 'live') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    } else {
        return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
}

// Create PayPal client
function client() {
    const env = environment();
    if (!env) return null;
    return new paypal.core.PayPalHttpClient(env);
}

/**
 * Create PayPal order
 * @param {Object} orderData - Order data with amount and currency
 * @returns {Promise<Object>} PayPal order response
 */
async function createOrder(orderData) {
    // Demo-safe fallback when PayPal isn't configured
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        return {
            success: true,
            demo: true,
            orderId: `DEMO-PAYPAL-ORDER-${Date.now()}`,
            status: 'CREATED',
            links: []
        };
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    // עיגול הסכום ל-2 ספרות עשרוניות (PayPal דורש פורמט זה)
    const roundedAmount = parseFloat(orderData.amount).toFixed(2);
    
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: orderData.currency || 'ILS',
                value: roundedAmount
            },
            description: orderData.description || 'Order payment'
        }]
    });

    try {
        const paypalClient = client();
        if (!paypalClient) throw new Error('PayPal client is not configured');

        const response = await paypalClient.execute(request);
        return {
            success: true,
            orderId: response.result.id,
            status: response.result.status,
            links: response.result.links
        };
    } catch (error) {
        console.error('PayPal create order error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create PayPal order'
        };
    }
}

/**
 * Capture PayPal payment
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<Object>} PayPal capture response
 */
async function captureOrder(orderId) {
    // Demo-safe fallback when PayPal isn't configured
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        return {
            success: true,
            demo: true,
            transactionId: `DEMO-PAYPAL-TXN-${Date.now()}`,
            status: 'COMPLETED',
            amount: null,
            currency: null,
            payerEmail: null,
            orderDetails: { id: orderId, status: 'COMPLETED' }
        };
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const paypalClient = client();
        if (!paypalClient) throw new Error('PayPal client is not configured');

        const response = await paypalClient.execute(request);
        
        // בדיקה שהתגובה תקינה
        if (!response.result || !response.result.purchase_units || !response.result.purchase_units[0]) {
            throw new Error('Invalid PayPal response structure');
        }
        
        const purchaseUnit = response.result.purchase_units[0];
        if (!purchaseUnit.payments || !purchaseUnit.payments.captures || !purchaseUnit.payments.captures[0]) {
            throw new Error('No capture found in PayPal response');
        }
        
        const capture = purchaseUnit.payments.captures[0];
        
        return {
            success: true,
            transactionId: capture.id,
            status: capture.status,
            amount: capture.amount.value,
            currency: capture.amount.currency_code,
            payerEmail: response.result.payer?.email_address,
            orderDetails: response.result
        };
    } catch (error) {
        console.error('PayPal capture order error:', error);
        return {
            success: false,
            error: error.message || 'Failed to capture PayPal payment'
        };
    }
}

module.exports = {
    createOrder,
    captureOrder
};

