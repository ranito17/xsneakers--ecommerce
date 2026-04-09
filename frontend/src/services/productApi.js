import api from './api';

const buildProductsQuery = (options = {}) => {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.set(key, value);
        }
    });

    const query = params.toString();
    return query ? `?${query}` : '';
};

// פונקציות API למוצרים וקטגוריות (כולל ניהול ומדדי מלאי)
export const productApi = {
    // קבלת כל המוצרים (אדמין, כולל לא פעילים ומדדים)
    getAllProducts: async (options = {}) => {
        try {
            const query = buildProductsQuery({
                audience: 'admin',
                includeInactive: true,
                includeOutOfStock: true,
                includeMetrics: true,
                includeAuditFields: true,
                ...options
            });
            const response = await api.get(`/api/productRoutes/${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // קבלת מוצרים ללקוח (מסתיר לא פעילים/חסרי מלאי)
    getProducts: async (options = {}) => {
        try {
            const query = buildProductsQuery({
                audience: 'customer',
                includeInactive: false,
                includeOutOfStock: false,
                includeMetrics: false,
                includeAuditFields: false,
                ...options
            });
            const response = await api.get(`/api/productRoutes/${query}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // קבלת מוצר לפי מזהה
    getProductById: async (productId) => {
        try {
            const response = await api.get(`/api/productRoutes/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // יצירת מוצר חדש
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
            // Return error response data if available (for duplicate name errors)
            if (error.response?.data) {
                return error.response.data;
            }
            throw error;
        }
    },

    // עדכון מוצר קיים
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

    // עדכון מידות בלבד למוצר
    updateProductSizes: async (productId, sizes) => {
        try {
            const response = await api.put(`/api/productRoutes/${productId}/sizes`, { sizes });
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

    // קבלת כל הקטגוריות
    getCategories: async () => {
        try {
            const response = await api.get('/api/categoryRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // קבלת קטגוריה לפי מזהה
    getCategoryById: async (categoryId) => {
        try {
            const response = await api.get(`/api/categoryRoutes/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // יצירת קטגוריה חדשה
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

    // מחיקת קטגוריה
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
    },

    // אנליטיקות דשבורד למלאי
    getLowStockProducts: async (threshold = 10) => {
        try {
            const response = await api.get(`/api/productRoutes/dashboard/low-stock?threshold=${threshold}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            throw error;
        }
    },

    getProductsWithLowStockSizes: async (sizeThreshold = 5) => {
        try {
            const response = await api.get(`/api/productRoutes/dashboard/low-stock-sizes?sizeThreshold=${sizeThreshold}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products with low stock sizes:', error);
            throw error;
        }
    },

    getProductStats: async () => {
        try {
            const response = await api.get('/api/productRoutes/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw error;
        }
    },

    getTopProducts: async () => {
        try {
            const response = await api.get('/api/productRoutes/dashboard/top-products');
            return response.data;
        } catch (error) {
            console.error('Error fetching top products:', error);
            throw error;
        }
    }
};

export default productApi; 