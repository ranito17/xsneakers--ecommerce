import api from './api';

// Cart API functions with authentication
export const cartApi = {
    // Get user's cart with all items
    getUserCart: async (userId) => {
        try {
            const response = await api.get(`/api/cartRoutes/cart/${userId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add item to cart (from product page)
    addToCart: async (userId, productId, quantity = 1, selected_size, selected_color) => {
        try {
            const response = await api.post('/api/cartRoutes/add', {
                userId,
                productId,
                quantity,
                selected_size,
                selected_color
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update item quantity (from cart page)
    updateQuantity: async (userId, cartItemId, quantity) => {
        try {
            const response = await api.put(`/api/cartRoutes/update/${cartItemId}`, {
                userId,
                quantity
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Remove item from cart
    removeFromCart: async (userId, cartItemId) => {
        try {
            const response = await api.delete(`/api/cartRoutes/remove/${cartItemId}`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Clear entire cart
    clearCart: async (userId) => {
        try {
            const response = await api.delete('/api/cartRoutes/clear', {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
