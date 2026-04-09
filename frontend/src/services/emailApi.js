import api from './api';

export const emailApi = {
    /**
     * שליחת אימייל יצירת קשר מהלקוח לחנות
     * @param {Object} contactData - נתוני טופס קשר
     * @param {string} contactData.name - שם הלקוח
     * @param {string} contactData.email - אימייל הלקוח
     * @param {string} contactData.subject - נושא ההודעה
     * @param {string} contactData.message - תוכן ההודעה
     */
    async sendContactEmail(contactData) {
        try {
            const response = await api.post('/api/contact', contactData);
            return response.data;
        } catch (error) {
            console.error('Error sending contact email:', error);
            throw new Error(error.response?.data?.message || 'Failed to send contact email');
        }
    }
};  