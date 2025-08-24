import api from './api';

const analyticsApi = {
    // Revenue Analytics
    getRevenueAnalytics: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/revenue', {
                params: { startDate, endDate, groupBy }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            throw error;
        }
    },

    // Product Analytics
    getProductAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/products', {
                params: { startDate, endDate }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            throw error;
        }
    },

    // User Analytics
    getUserAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/users', {
                params: { startDate, endDate }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            throw error;
        }
    },

    // Profit Analytics
    getProfitAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/profit', {
                params: { startDate, endDate }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching profit analytics:', error);
            throw error;
        }
    },

    // Order Status Analytics
    getOrderStatusAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/status', {
                params: { startDate, endDate }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching order status analytics:', error);
            throw error;
        }
    },

    // Geographic Analytics
    getGeographicAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/geographic', {
                params: { startDate, endDate }
            });
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching geographic analytics:', error);
            throw error;
        }
    },

    // Dashboard Stats (existing)
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/orderRoutes/dashboard/stats');
            return response.data.data; // Extract the data field from the response
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get all analytics data for a date range
    getAllAnalytics: async (startDate, endDate, groupBy = 'day') => {
        try {
            console.log('Fetching analytics data with params:', { startDate, endDate, groupBy });
            
            const [
                revenueData,
                productData,
                userData,
                profitData,
                statusData,
                geographicData
            ] = await Promise.all([
                analyticsApi.getRevenueAnalytics(startDate, endDate, groupBy),
                analyticsApi.getProductAnalytics(startDate, endDate),
                analyticsApi.getUserAnalytics(startDate, endDate),
                analyticsApi.getProfitAnalytics(startDate, endDate),
                analyticsApi.getOrderStatusAnalytics(startDate, endDate),
                analyticsApi.getGeographicAnalytics(startDate, endDate)
            ]);

            console.log('Individual analytics data:', {
                revenueData,
                productData,
                userData,
                profitData,
                statusData,
                geographicData
            });

            const result = {
                revenue: revenueData,
                products: productData,
                users: userData,
                profit: profitData,
                orderStatus: statusData,
                geographic: geographicData
            };

            console.log('Combined analytics result:', result);
            return result;
        } catch (error) {
            console.error('Error fetching all analytics:', error);
            throw error;
        }
    }
};

export default analyticsApi;
