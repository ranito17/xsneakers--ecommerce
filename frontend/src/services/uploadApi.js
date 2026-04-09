import api from './api';

export const uploadApi = {
    /**
     * העלאת מספר תמונות למוצר
     * @param {number} productId - מזהה המוצר
     * @param {File[]} files - מערך קבצי תמונה להעלאה
     * @param {Function} onProgress - 콜בק אופציונלי למעקב התקדמות
     * @returns {Promise} תגובת שרת עם כתובות התמונות
     */
    uploadProductImages: async (productId, files, onProgress = null) => {
        try {
            const formData = new FormData();
            
            // Append each file to FormData
            files.forEach((file, index) => {
                formData.append('images', file);
            });
            
            // Append product ID
            formData.append('productId', productId);

            const response = await api.post('/api/upload/product-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                },
            });

            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            console.error('Error uploading product images:', error);
            throw new Error(error.response?.data?.message || 'Failed to upload images');
        }
    },

    /**
     * מחיקת תמונה ספציפית ממוצר
     * @param {number} productId - מזהה המוצר
     * @param {string} imageUrl - כתובת התמונה למחיקה
     * @returns {Promise} תגובה עם הצלחה/כשלון
     */
    deleteProductImage: async (productId, imageUrl) => {
        try {
            const response = await api.delete(`/api/upload/product-images/${productId}`, {
                data: { imageUrl }
            });

            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            console.error('Error deleting product image:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete image');
        }
    },

    /**
     * מחיקת כל התמונות של מוצר
     * @param {number} productId - מזהה המוצר
     * @returns {Promise} תגובה עם הצלחה/כשלון
     */
    deleteAllProductImages: async (productId) => {
        try {
            const response = await api.delete(`/api/upload/product-images/${productId}/all`);

            return response.data;
        } catch (error) {
            // Handle authorization errors
            if (error.response?.status === 403) {
                window.location.href = '/unauthorized';
                return;
            }
            console.error('Error deleting all product images:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete all images');
        }
    },

    /**
     * ולידציה לקובץ לפני העלאה
     * @param {File} file - הקובץ לבדיקה
     * @returns {Object} תוצאה עם isValid והודעת שגיאה
     */
    validateFile: (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File size must be less than 5MB'
            };
        }

        return { isValid: true, error: null };
    },

    /**
     * המרת גודל קובץ לפורמט קריא
     * @param {number} bytes - גודל בבייטים
     * @returns {string} גודל מעוצב
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}; 