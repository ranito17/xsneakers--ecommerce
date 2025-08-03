import api from './api';

// Settings API functions
export const settingsApi = {
    // Get current settings
    getSettings: async () => {
        try {
            const response = await api.get('/api/settingsRoutes');
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

    // Update settings
    updateSettings: async (settingsData) => {
        try {
            const response = await api.put('/api/settingsRoutes', settingsData);
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