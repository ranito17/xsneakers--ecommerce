import api from './api';

// Authentication API functions
export const authApi = {
    // Check if user is authenticated
    checkAuth: async () => {
        try {
            const response = await api.get('/api/userRoutes/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Login user
    login: async (email, password) => {
        try {
            const response = await api.post('/api/userRoutes/login', {
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Signup user
    signup: async (userData) => {
        try {
            const response = await api.post('/api/userRoutes/signup', {
                full_name: userData.full_name,
                email: userData.email,
                password: userData.password,
                address: userData.address || '',
                phone_number: userData.phone_number || '',
                role: 'customer' // Default role for new users
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await api.post('/api/userRoutes/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/api/userRoutes/forgot-password', {
                email
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post('/api/userRoutes/reset-password', {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Verify reset token
    verifyResetToken: async (token) => {
        try {
            const response = await api.get(`/api/userRoutes/verify-reset-token/${token}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
