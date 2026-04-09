import api from './api';

// פונקציות API להזמנות (דורש התחברות לאדמין/משתמש רלוונטי)
export const orderApi = {
    // יצירת הזמנה חדשה
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
    // Orders for the currently authenticated user
    getUserOrders: async () => {
        try {
            const response = await api.get('/api/orderRoutes/my-orders');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getUserOrderCount: async () => {
        try {
            const response = await api.get('/api/orderRoutes/my-orders/count');
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
    
    // אנליטיקות דשבורד
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

    getFilteredRecentOrders: async (queryParams = '') => {
        try {
            const response = await api.get(`/api/orderRoutes/filtered/recent?${queryParams}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered recent orders:', error);
            throw error;
        }
    },

    // הורדת קובץ PDF קבלה להזמנה
    // שליחה לשרת: GET /api/orderRoutes/:orderId/receipt
    // תגובה מהשרת: PDF כ-blob להורדה
    downloadOrderReceiptPDF: async (orderId) => {
        try {
            const response = await api.get(`/api/orderRoutes/${orderId}/receipt`, {
                responseType: 'blob'
            });
            
            // יצירת URL מה-blob והורדה
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.error('Error downloading PDF receipt:', error);
            throw error;
        }
    }
};  
