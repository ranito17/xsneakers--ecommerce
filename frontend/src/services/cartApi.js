import api from './api';

// Cart API functions - backend handles guest vs logged-in user logic
export const cartApi = {
    // Get user's cart (works for both guests and logged-in users)
    getUserCart: async () => {
        try {
            const response = await api.get('/api/cartRoutes/cart');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Add item to cart (works for both guests and logged-in users)
    addToCart: async (productId, quantity = 1, selected_size = null, selected_color = null) => {
        try {
            const response = await api.post('/api/cartRoutes/add', {
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

    // Update item quantity (works for both guests and logged-in users)
    updateQuantity: async (cartItemId, quantity) => {
        try {
            const response = await api.put(`/api/cartRoutes/update/${cartItemId}`, {
                quantity
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Remove item from cart (works for both guests and logged-in users)
    removeFromCart: async (cartItemId) => {
        try {
            const response = await api.delete(`/api/cartRoutes/remove/${cartItemId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Clear entire cart (works for both guests and logged-in users)
    clearCart: async () => {
        try {
            const response = await api.delete('/api/cartRoutes/clear');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
