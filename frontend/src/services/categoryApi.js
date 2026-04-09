import api from './api';

// פונקציות API לקטגוריות (כולל ניהול תמונות) - מצריך התחברות לאדמין
export const categoryApi = {
    // קבלת כל הקטגוריות
    getCategories: async () => {
        try {
            const response = await api.get('/api/categoryRoutes/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // יצירת קטגוריה חדשה
    addCategory: async (categoryData) => {
        try {
            const response = await api.post('/api/categoryRoutes/', categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // עדכון קטגוריה קיימת
    updateCategory: async (categoryId, categoryData) => {
        try {
            const response = await api.put(`/api/categoryRoutes/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // השבתת קטגוריה (מפעיל גם השבתת מוצרים בקטגוריה)
    deactivateCategory: async (categoryId) => {
        try {
            const response = await api.patch(`/api/categoryRoutes/${categoryId}/deactivate`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // הפעלת קטגוריה
    activateCategory: async (categoryId) => {
        try {
            const response = await api.patch(`/api/categoryRoutes/${categoryId}/activate`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // העלאת תמונת קטגוריה
    uploadCategoryImage: async (categoryId, file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('categoryId', categoryId);
            
            const response = await api.post('/api/categoryRoutes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
    // מחיקת תמונת קטגוריה
    deleteCategoryImage: async (categoryId, imageUrl) => {
        try {
            const response = await api.delete(`/api/categoryRoutes/${categoryId}/image`, {
                data: { imageUrl }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}   