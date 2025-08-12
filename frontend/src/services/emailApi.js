import api from './api';

export const emailApi = {
    /**
     * Send customer contact email
     * @param {Object} contactData - Contact form data
     * @param {string} contactData.name - Customer name
     * @param {string} contactData.email - Customer email
     * @param {string} contactData.subject - Email subject
     * @param {string} contactData.message - Email message
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