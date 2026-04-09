import api from './api';

// פונקציות API לתשלומים (PayPal)
export const paymentApi = {
    // יצירת הזמנת PayPal
    createPayPalOrder: async (orderData) => {
        try {
            const response = await api.post('/api/payments/paypal/create-order', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // גביית תשלום PayPal לאחר אישור
    capturePayPalOrder: async ({ orderId, address, items, delivery_cost }) => {
        try {
            const response = await api.post('/api/payments/paypal/capture-order', {
                orderId,
                address,
                items,
                delivery_cost
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

