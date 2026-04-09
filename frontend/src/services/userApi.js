import api from './api';

// קבלת כל המשתמשים (אדמין)
export const getAllUsers = async () => {
    try {
        const response = await api.get('/api/userRoutes/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

// קבלת עגלת משתמש (אדמין)
export const getUserCart = async (userId) => {
    try {
        const response = await api.get(`/api/cartRoutes/admin/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user cart:', error);
        throw error;
    }
};

// קבלת פרופיל המשתמש הנוכחי
export const getProfile = async () => {
    try {
        const response = await api.get('/api/userRoutes/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
};

// עדכון פרופיל (שם, טלפון)
export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/api/userRoutes/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// עדכון כתובת משתמש
export const updateAddress = async (addressData) => {
    try {
        const response = await api.put('/api/userRoutes/address', addressData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

// שינוי סיסמה
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/api/userRoutes/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// קבלת רשימת מועדפים
export const getWishlist = async () => {
    try {
        const response = await api.get('/api/userRoutes/wishlist');
        return response.data;
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
    }
};

// הוספה למועדפים
export const addToWishlist = async (productId) => {
    try {
        const response = await api.post('/api/userRoutes/wishlist', { productId });
        return response.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

// הסרת מועדפים
export const removeFromWishlist = async (productId) => {
    try {
        const response = await api.delete(`/api/userRoutes/wishlist/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};

// קבלת מספר הזמנות של משתמש ספציפי (אדמין)
export const getUserOrderCount = async (userId) => {
    try {
        const response = await api.get(`/api/orderRoutes/admin/user/${userId}/count`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user order count:', error);
        throw error;
    }
};

export const userApi = {
    getAllUsers,
    getUserCart,
    getProfile,
    updateProfile,
    updateAddress,
    changePassword,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getUserOrderCount
};