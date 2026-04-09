import api from './api';

export const supplierApi = {
    /**
     * שליחת בקשת מילוי מלאי לספק דרך ה-API
     * @param {Object} refuelData - נתוני בקשת מילוי מלאי
     * @param {Array} refuelData.products - מערך מוצרים שצריך לתגבר
     * @param {string} refuelData.notes - הערות נוספות לספק (אופציונלי)
     * @returns {Promise<Object>} תגובת השרת לאחר שליחת האימייל
     */
    async sendStockRefuelEmail(refuelData) {
        try {
            const response = await api.post('/api/supplier/refuel', refuelData);
            return response.data;
        } catch (error) {
            console.error('Error sending stock refuel email:', error);
            throw new Error(error.response?.data?.message || 'Failed to send stock refuel email');
        }
    }
};
