const Analytics = require('../models/Analytics');
const Cart = require('../models/Cart');

// בקר אנליטיקס
// מתאם נתוני אנליטיקס ממודלים מרובים:
// - אנליטיקס הזמנות (הכנסות, סטטוס הזמנות)
// - אנליטיקס מוצרים (ביצועים, קטגוריות)
// - אנליטיקס משתמשים (צמיחה, מעורבות)
// - אנליטיקס עגלות (נטישה, המרה)
// בקר זה פועל כמתאם המשתמש בפונקציות מודל קיימות
// לצבירה ועיצוב נתוני אנליטיקס ל-frontend

// קבלת אנליטיקס פיננסי (ממוקד הכנסות)
const getFinanceAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        // קבלת אנליטיקס הכנסות
        const revenueData = await Analytics.getRevenueAnalytics(startDate, endDate, groupBy);
        
        // חישוב מטריקות סיכום
        const totalRevenue = revenueData.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);
        const totalOrders = revenueData.reduce((sum, item) => sum + (parseInt(item.order_count) || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.status(200).json({
            success: true,
            message: 'Finance analytics retrieved successfully',
            data: {
                revenue: revenueData,
                summary: {
                    totalRevenue,
                    totalOrders,
                    averageOrderValue: avgOrderValue
                }
            }
        });
    } catch (err) {
        console.error('Error in getFinanceAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch finance analytics',
            data: null
        });
    }
};

/**
 * Get user analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const userData = await Analytics.getUserAnalytics(startDate, endDate);
        
        res.status(200).json({
            success: true,
            message: 'User analytics retrieved successfully',
            data: userData
        });
    } catch (err) {
        console.error('Error in getUserAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch user analytics',
            data: null
        });
    }
};

/**
 * Get product analytics (including category performance)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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
        console.error('Error in getProductAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch product analytics',
            data: null
        });
    }
};

/**
 * Get order analytics (order status and fulfillment)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOrderAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        // Get order status distribution
        const statusDistribution = await Analytics.getOrderStatusAnalytics(startDate, endDate);
        
        // Get revenue data for orders chart
        const revenueData = await Analytics.getRevenueAnalytics(startDate, endDate, 'day');
        
        // Get overall size distribution
        const sizeDistribution = await Analytics.getOverallSizeAnalytics(startDate, endDate);
        
        res.status(200).json({
            success: true,
            message: 'Order analytics retrieved successfully',
            data: {
                statusDistribution,
                revenue: revenueData,
                sizeDistribution
            }
        });
    } catch (err) {
        console.error('Error in getOrderAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch order analytics',
            data: null
        });
    }
};

/**
 * Get user list analytics with order statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserListAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const userList = await Analytics.getUserListAnalytics(startDate, endDate);
        
        res.status(200).json({
            success: true,
            message: 'User list analytics retrieved successfully',
            data: userList
        });
    } catch (err) {
        console.error('Error in getUserListAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch user list analytics',
            data: null
        });
    }
};

/**
 * Get cart analytics (abandonment, conversion)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCartAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const cartData = await Cart.getCartAnalytics(startDate, endDate);
        
        res.status(200).json({
            success: true,
            message: 'Cart analytics retrieved successfully',
            data: cartData
        });
    } catch (err) {
        console.error('Error in getCartAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch cart analytics',
            data: null
        });
    }
};

/**
 * Get simplified/combined analytics (for backward compatibility)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSimplifiedAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        // Fetch all analytics in parallel
        const [revenueData, productData, userData] = await Promise.all([
            Analytics.getRevenueAnalytics(startDate, endDate, 'day'),
            Analytics.getProductAnalytics(startDate, endDate),
            Analytics.getUserAnalytics(startDate, endDate)
        ]);

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: {
                revenue: revenueData,
                products: productData,
                users: userData
            }
        });
    } catch (err) {
        console.error('Error in getSimplifiedAnalytics:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to fetch analytics',
            data: null
        });
    }
};

module.exports = {
    getFinanceAnalytics,
    getUserAnalytics,
    getUserListAnalytics,
    getProductAnalytics,
    getOrderAnalytics,
    getCartAnalytics,
    getSimplifiedAnalytics
};

