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

const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.deleteOrder(orderId);
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
};

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

module.exports = {
    placeOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    getUserOrders,
    deleteOrder,
    getOrderItems
};