import api from './api';

// Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const response = await api.get('/api/userRoutes/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};
