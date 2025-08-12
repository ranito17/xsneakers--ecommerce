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
    deleteOrder: async (orderId) => {   
        try {
            const response = await api.delete(`/api/orderRoutes/${orderId}`);
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
    }
};  
