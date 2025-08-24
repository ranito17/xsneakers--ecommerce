import api from './api';

// Settings API functions
export const settingsApi = {
    // Get current settings (requires authentication)
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

    // Get public settings (no authentication required)
    getPublicSettings: async () => {
        try {
            const response = await api.get('/api/settingsRoutes/public');
            return response.data;
        } catch (error) {
            console.error('Error fetching public settings:', error);
            return { success: false, data: null };
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