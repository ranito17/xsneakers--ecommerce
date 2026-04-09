// Activity Logger Helper
// Reusable function to log important admin and system activities to the database
// IMPORTANT: Only use for data-modifying actions (POST, PUT, PATCH, DELETE)
// DO NOT use for GET requests - they only read data, not change it
const Activity = require('../models/Activity');
/**
 * Log an activity to the database
 * @param {Object} req - Express request object
 * @param {Object} options - Activity options
 * @param {string} options.action_type - Type of action (e.g., 'ORDER_PLACED', 'PRODUCT_UPDATED')
 * @param {string} options.entity_type - Type of entity (e.g., 'order', 'product', 'user')
 * @param {number} options.entity_id - ID of the entity (optional)
 * @param {string} options.description - Human-readable description of the action
 * @param {Object} options.details - Additional details about the action (optional)
 */
const logActivity = async (req, options) => {
    try {
        const { action_type, entity_type, entity_id, description, details = {} } = options;

        // Get user from request (set by auth middleware)
        const userId = req.user ? (req.user.user_id || req.user.id) : null;

        // Create activity log (without details, ip_address, or user_agent)
        await Activity.create({
            user_id: userId,
            action_type,
            entity_type,
            entity_id: entity_id || null,
            description
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw - we don't want logging failures to affect the application
    }
};

/**
 * Middleware wrapper for logActivity that can be used in routes
 * Usage: router.post('/path', trackActivity(options), controller)
 * 
 * BEST PRACTICES:
 * - Only use with POST, PUT, PATCH, DELETE routes (data-modifying actions)
 * - Never use with GET routes (they only read data)
 * - Track important admin actions: creating/updating/deleting products, categories, users
 * - Track order lifecycle: placement, status changes, cancellations
 * - Track inventory changes: stock updates
 * - Track critical settings changes: global configuration updates
 */
const trackActivity = (options) => {
    return async (req, res, next) => {
        // Flag to prevent duplicate logging
        let activityLogged = false;

        // Store the original res.json and res.send
        const originalJson = res.json.bind(res);
        const originalSend = res.send.bind(res);

        // Helper function to log activity (only once)
        const logActivityOnce = async (data) => {
            if (activityLogged) return;
            activityLogged = true;

            // Only log on successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                setImmediate(async () => {
                    try {
                        // If options is a function, call it with req, res, data to get dynamic options
                        const activityOptions = typeof options === 'function' 
                            ? options(req, res, data) 
                            : options;
                        
                        if (activityOptions) {
                            await logActivity(req, activityOptions);
                        }
                    } catch (error) {
                        console.error('Error in trackActivity middleware:', error);
                    }
                });
            }
        };

        // Override res.json
        res.json = function (data) {
            logActivityOnce(data);
            return originalJson(data);
        };

        // Override res.send
        res.send = function (data) {
            logActivityOnce(data);
            return originalSend(data);
        };

        next();
    };
};

// Action type constants for consistency
const ACTION_TYPES = {
    // Order actions (POST, PUT, PATCH, DELETE)
    ORDER_PLACED: 'ORDER_PLACED',
    ORDER_UPDATED: 'ORDER_UPDATED',
    ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    ORDER_FULFILLED: 'ORDER_FULFILLED',
    
    // Product actions (POST, PUT, DELETE)
    PRODUCT_CREATED: 'PRODUCT_CREATED',
    PRODUCT_UPDATED: 'PRODUCT_UPDATED',
    PRODUCT_DELETED: 'PRODUCT_DELETED',
    STOCK_CHANGED: 'STOCK_CHANGED',
    STOCK_INCREASED: 'STOCK_INCREASED',
    STOCK_DECREASED: 'STOCK_DECREASED',
    
    // Category actions (POST, PUT, DELETE)
    CATEGORY_CREATED: 'CATEGORY_CREATED',
    CATEGORY_UPDATED: 'CATEGORY_UPDATED',
    CATEGORY_DELETED: 'CATEGORY_DELETED',
    
    // User actions (POST)
    USER_CREATED: 'USER_CREATED',
    
    // Settings actions (PUT)
    SETTINGS_UPDATED: 'SETTINGS_UPDATED',
    
    // Message actions (POST)
    MESSAGE_REPLIED: 'MESSAGE_REPLIED',
    MESSAGE_SENT: 'MESSAGE_SENT',
    
    // Supplier actions (POST, PUT)
    SUPPLIER_REQUEST_CREATED: 'SUPPLIER_REQUEST_CREATED',
    SUPPLIER_REQUEST_FULFILLED: 'SUPPLIER_REQUEST_FULFILLED'
};

// Entity type constants
const ENTITY_TYPES = {
    ORDER: 'order',
    PRODUCT: 'product',
    CATEGORY: 'category',
    USER: 'user',
    SETTINGS: 'settings',
    MESSAGE: 'message',
    SUPPLIER: 'supplier'
};

module.exports = {
    logActivity,
    trackActivity,
    ACTION_TYPES,
    ENTITY_TYPES
};
