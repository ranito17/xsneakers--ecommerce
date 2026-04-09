import api from './api';

// פונקציות API לעגלה - השרת מטפל בהבדל אורח/משתמש מחובר
export const cartApi = {
    // קבלת עגלת המשתמש (אורח או מחובר)
    getUserCart: async () => {
        try {
            const response = await api.get('/api/cartRoutes/cart');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // הוספת פריט לעגלה (אורח/מחובר)
    addToCart: async (productId, quantity = 1, selected_size = null) => {
        try {
            const response = await api.post('/api/cartRoutes/add', {
                productId,
                quantity,
                selected_size
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // עדכון כמות פריט
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

    // הסרת פריט מהעגלה
    removeFromCart: async (cartItemId) => {
        try {
            const response = await api.delete(`/api/cartRoutes/remove/${cartItemId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ניקוי כל העגלה
    clearCart: async () => {
        try {
            const response = await api.delete('/api/cartRoutes/clear');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
