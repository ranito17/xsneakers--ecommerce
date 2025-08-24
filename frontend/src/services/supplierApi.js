import api from './api';

export const supplierApi = {
    /**
     * Send stock refuel email to supplier
     * @param {Object} refuelData - Stock refuel request data
     * @param {Array} refuelData.products - Array of products needing restock
     * @param {string} refuelData.notes - Optional notes for the supplier
     */
    async sendStockRefuelEmail(refuelData) {
        try {
            const response = await api.post('/api/supplier/refuel', refuelData);
            return response.data;
        } catch (error) {
            console.error('Error sending stock refuel email:', error);
            throw new Error(error.response?.data?.message || 'Failed to send stock refuel email');
        }
    },

    /**
     * Get fulfillment status by token
     * @param {string} token - Fulfillment token
     */
    async getFulfillmentStatus(token) {
        try {
            const response = await api.get(`/api/supplier/status/${token}`);
            return response.data;
        } catch (error) {
            console.error('Error getting fulfillment status:', error);
            throw new Error(error.response?.data?.message || 'Failed to get fulfillment status');
        }
    }
};
