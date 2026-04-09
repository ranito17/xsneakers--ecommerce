import api from './api';

/**
 * שירות אנליטיקות (Analytics API)
 * מאפשר למשוך נתוני הכנסות, ביצועי מוצרים ומשתמשים מהשרת
 * כולל חיתוך לפי תאריכים וקיבוץ לפי יום/שבוע/חודש/שנה
 */
const analyticsApi = {
    /**
     * קבלת אנליטיקת הכנסות
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @param {string} groupBy - קיבוץ לפי day/week/month/year
     * @returns {Promise<Array>} מערך נתוני הכנסות
     */
    getRevenueAnalytics: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/revenue', {
                params: { startDate, endDate, groupBy }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת מוצרים
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Object>} נתוני ביצועי מוצרים
     */
    getProductAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/products', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching product analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת משתמשים בטווח תאריכים
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Object>} נתוני משתמשים
     */
    getUserAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/orderRoutes/analytics/users', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקה מרוכזת (הכנסות, מוצרים, משתמשים)
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Object>} נתונים משולבים
     */
    getSimplifiedAnalytics: async (startDate, endDate) => {
        try {
            const [revenueData, productData, userData] = await Promise.all([
                analyticsApi.getRevenueAnalytics(startDate, endDate, 'day'),
                analyticsApi.getProductAnalytics(startDate, endDate),
                analyticsApi.getUserAnalytics(startDate, endDate)
            ]);

            return {
                revenue: revenueData,
                products: productData,
                users: userData
            };
        } catch (error) {
            console.error('Error fetching simplified analytics:', error);
            throw error;
        }
    },

    /**
     * סטטיסטיקות ללוח בקרה
     * @returns {Promise<Object>} נתוני דשבורד
     */
    getDashboardStats: async () => {
        try {
            const response = await api.get('/api/orderRoutes/dashboard/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    /**
     * קבלת המוצרים הנמכרים ביותר
     * @param {string|number|null} limit - הגבלת כמות ('all'/null לכל, מספר להגבלה)
     * @returns {Promise<Object>} נתוני רבי מכר
     */
    getBestSellers: async (limit = undefined) => {
        try {
            const params = {};
            if (limit === 'all' || limit === null) {
                params.limit = 'all';
            } else if (limit !== undefined) {
                params.limit = limit;
            }
            
            const response = await api.get('/api/orderRoutes/analytics/best-sellers', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching best sellers:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת פיננסים (מיקוד הכנסות)
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @param {string} groupBy - קיבוץ day/week/month/year
     * @returns {Promise<Object>} נתוני פיננסים
     */
    getFinanceAnalytics: async (startDate, endDate, groupBy = 'day') => {
        try {
            const response = await api.get('/api/analytics/finance', {
                params: { startDate, endDate, groupBy }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching finance analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת הזמנות (סטטוס וביצוע)
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Object>} נתוני הזמנות
     */
    getOrderAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/analytics/orders', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching order analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת עגלות (נטישה/המרה)
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Object>} נתוני עגלות
     */
    getCartAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/analytics/cart', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching cart analytics:', error);
            throw error;
        }
    },

    /**
     * אנליטיקת רשימת משתמשים כולל סטטיסטיקות הזמנות
     * @param {string} startDate - תאריך התחלה YYYY-MM-DD
     * @param {string} endDate - תאריך סיום YYYY-MM-DD
     * @returns {Promise<Array>} רשימת משתמשים עם נתוני הזמנות
     */
    getUserListAnalytics: async (startDate, endDate) => {
        try {
            const response = await api.get('/api/analytics/users/list', {
                params: { startDate, endDate }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching user list analytics:', error);
            throw error;
        }
    }
};

export default analyticsApi;
