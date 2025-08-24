import api from './api';

// Order API functions with authentication
export const orderApi = {
    // Place a new order
    placeOrder: async (orderData) => {
        try {   
            const response = await api.post('/api/orderRoutes/place', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getAllOrders: async () => {
        try {
            const response = await api.get('/api/orderRoutes');
            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            throw error;
        }
    },
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/api/orderRoutes/${orderId}`);
            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            throw error;
        }
    },
    updateOrder: async (orderId, orderData) => {
        try {
            const response = await api.put(`/api/orderRoutes/${orderId}`, orderData);
            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            throw error;
        }
    },
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/api/orderRoutes/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            throw error;
        }
    },
    // Order deletion removed - financial data must be preserved
    // deleteOrder function removed for compliance with financial data protection
    getUserOrders: async (userId) => {
        try {
            const response = await api.get(`/api/orderRoutes/user/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getOrderItems: async (orderId) => {
        try {
            const response = await api.get(`/api/orderRoutes/${orderId}/items`);
            console.log('Order items:', response.data);
            return response.data;
            
        } catch (error) {
            throw error;
        }
    },
    
    // Dashboard Analytics
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/orderRoutes/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    getOrdersByStatus: async (status) => {
        try {
            const response = await api.get(`/api/orderRoutes/status/${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders with status ${status}:`, error);
            throw error;
        }
    },

    // Enhanced Analytics API Functions
    getRevenueAnalytics: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/revenue', {
                params: { startDate, endDate, groupBy }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            throw error;
        }
    },

    getProductAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/products', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            throw error;
        }
    },

    getUserAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/users', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            throw error;
        }
    },

    getProfitAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/profit', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching profit analytics:', error);
            throw error;
        }
    },

    getOrderStatusAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/status', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching order status analytics:', error);
            throw error;
        }
    },

    getGeographicAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/geographic', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching geographic analytics:', error);
            throw error;
        }
    }
};  
