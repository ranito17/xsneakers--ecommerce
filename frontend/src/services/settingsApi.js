import api from './api';

// פונקציות API להגדרות מערכת
export const settingsApi = {
    // קבלת כלל ההגדרות (דורש התחברות)
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

    // קבלת הגדרות ציבוריות (ללא התחברות)
    getPublicSettings: async () => {
        try {
            const response = await api.get('/api/settingsRoutes/public');
            return response.data;
        } catch (error) {
            console.error('Error fetching public settings:', error);
            return { success: false, data: null };
        }
    },

    // עדכון הגדרות
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