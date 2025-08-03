import api from './api';

// Product and Category API functions
export const productApi = {
    // Get all products (alias for getProducts)
    getAllProducts: async () => {
        try {
            const response = await api.get('/api/productRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all products
    getProducts: async () => {
        try {
            const response = await api.get('/api/productRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get product by ID
    getProductById: async (productId) => {
        try {
            const response = await api.get(`/api/productRoutes/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new product
    createProduct: async (productData) => {
        try {
            const response = await api.post('/api/productRoutes/', productData);
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

    // Update product
    updateProduct: async (productId, productData) => {
        try {
            const response = await api.put(`/api/productRoutes/${productId}`, productData);
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

    // Delete product
    deleteProduct: async (productId) => {
        try {
            const response = await api.delete(`/api/productRoutes/${productId}`);
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

    // Get all categories
    getCategories: async () => {
        try {
            const response = await api.get('/api/categoryRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get category by ID
    getCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/api/categoryRoutes/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Create new category
    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/api/categoryRoutes/', categoryData);
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

    // Delete category
    deleteCategory: async (categoryId) => {
        try {
            const response = await api.delete(`/api/categoryRoutes/${categoryId}`);
            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            throw error;
        }
    }
};

export default productApi; 