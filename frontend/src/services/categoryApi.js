import api from './api';

// Category API functions with authentication
export const categoryApi = {
    // Get all categories
    getCategories: async () => {
        try {
            const response = await api.get('/api/categoryRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // Add new category
    addCategory: async (categoryData) => {
        try {
            const response = await api.post('/api/categoryRoutes/', categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/api/categoryRoutes/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}   