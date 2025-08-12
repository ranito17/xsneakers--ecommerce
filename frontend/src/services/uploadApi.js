import api from './api';

export const uploadApi = {
    /**
     * Upload multiple images for a product
     * @param {number} productId - The ID of the product
     * @param {File[]} files - Array of image files to upload
     * @param {Function} onProgress - Optional progress callback
     * @returns {Promise} - Response with uploaded image URLs
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
     * Delete a specific image from a product
     * @param {number} productId - The ID of the product
     * @param {string} imageUrl - The URL of the image to delete
     * @returns {Promise} - Response indicating success/failure
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
     * Validate file before upload
     * @param {File} file - The file to validate
     * @returns {Object} - Validation result with isValid and error message
     */
    validateFile: (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Only JPEG, PNG, WebP, and GIF images are allowed'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File size must be less than 5MB'
            };
        }

        return { isValid: true, error: null };
    },

    /**
     * Get file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted file size
     */
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}; 