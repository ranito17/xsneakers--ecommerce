import api from './api';

// פונקציות API לאימות משתמשים (Login/Signup/Reset)
export const authApi = {
    // בדיקת סטטוס התחברות
    checkAuth: async () => {
        try {
            const response = await api.get('/api/userRoutes/me');
            console.log('🔍 Auth API: Response from /me:', response);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // התחברות משתמש
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

    // הרשמת משתמש חדש
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

    // התנתקות
    logout: async () => {
        try {
            const response = await api.post('/api/userRoutes/logout');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // בקשת קוד שחזור סיסמה
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

    // איפוס סיסמה עם קוד שחזור
    resetPassword: async (email, code, newPassword, confirmPassword) => {
        try {
            const response = await api.post('/api/userRoutes/reset-password', {
                email,
                code,
                newPassword,
                confirmPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
