const Order = require('../models/Order');

const placeOrder = async (req, res) => {
    try {
        const orderData = req.body;
        const result = await Order.placeOrder(orderData);
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
}       

const getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.getUserOrders(userId);
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
        const order = await Order.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
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
}

const updateOrder = async (req, res) => {  
    try {
        const orderId = req.params.id;
        const orderData = req.body;
        const result = await Order.updateOrder(orderId, orderData);
        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
}   

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
                data: null
            });
        }
        
        const result = await Order.updateOrderStatus(orderId, status);
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

// Order deletion is not allowed for financial data protection
// Orders must be preserved for accounting, legal, and audit purposes


const getOrderItems = async (req, res) => {
    try {
        const orderId = req.params.id;
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

// Dashboard Analytics Endpoints
const getDashboardStats = async (req, res) => {
    try {
        const stats = await Order.getDashboardStats();
        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: stats
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

// Enhanced Analytics Controllers
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

        const revenueData = await Order.getRevenueAnalytics(startDate, endDate, groupBy);
        res.status(200).json({
            success: true,
            message: 'Revenue analytics retrieved successfully',
            data: revenueData
        });
    } catch (err) {
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

        const productData = await Order.getProductAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'Product analytics retrieved successfully',
            data: productData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

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

        const userData = await Order.getUserAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'User analytics retrieved successfully',
            data: userData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

const getProfitAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const profitData = await Order.getProfitAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'Profit analytics retrieved successfully',
            data: profitData
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

        const statusData = await Order.getOrderStatusAnalytics(startDate, endDate);
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

const getGeographicAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
                data: null
            });
        }

        const geographicData = await Order.getGeographicAnalytics(startDate, endDate);
        res.status(200).json({
            success: true,
            message: 'Geographic analytics retrieved successfully',
            data: geographicData
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
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