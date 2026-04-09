import React, { useState, useEffect } from 'react';
import { validateCategoryForm } from '../../../utils/form.validation';
import styles from './categories.module.css';
import { getAbsoluteImageUrl } from '../../../utils/image.utils';

const CategoryModal = ({ 
    category = null, 
    onSave, 
    onClose, 
    onImageDelete,
    isLoading = false 
}) => {
    const isEditMode = !!category;
    
    const [formData, setFormData] = useState({
        category_name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState(null);

    // Initialize form data when category prop changes
    useEffect(() => {
        if (category) {
            setFormData({
                category_name: category.category_name || '',
                description: category.description || ''
            });
            
            // Parse image URL from JSON if exists
            let imageUrl = null;
            if (category.image_urls) {
                try {
                    const parsedUrls = JSON.parse(category.image_urls);
                    imageUrl = Array.isArray(parsedUrls) && parsedUrls.length > 0 ? parsedUrls[0] : null;
                } catch {
                    imageUrl = category.image_urls;
                }
            }
            setExistingImageUrl(imageUrl);
            setImagePreview(imageUrl);
        } else {
            setFormData({
                category_name: '',
                description: ''
            });
            setExistingImageUrl(null);
            setImagePreview(null);
        }
        setImageFile(null);
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Image size must be less than 5MB'
                }));
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Only JPEG, PNG, WebP, and GIF images are allowed'
                }));
                return;
            }
            
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });
        }
    };

    const handleRemoveImage = async () => {
        if (isEditMode && existingImageUrl && !imageFile) {
            // Delete existing image from server
            try {
                if (onImageDelete) {
                    await onImageDelete(category.category_id, existingImageUrl);
                }
                setExistingImageUrl(null);
                setImagePreview(null);
            } catch (err) {
                console.error('Error removing image:', err);
                setErrors(prev => ({
                    ...prev,
                    image: 'Failed to remove image'
                }));
            }
        } else {
            // Just remove preview for new upload
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setErrors({});
        
        // Validate form
        const validation = validateCategoryForm(formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        
        try {
            await onSave(formData, imageFile);
        } catch (err) {
            setErrors({ general: err.message || 'Failed to save category' });
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const isFormValid = () => {
        return formData.category_name.trim().length > 3 && 
               formData.description.trim().length >= 10 && 
               !isLoading;
    };

    const getAllErrors = () => {
        const errorMessages = [];
        Object.keys(errors).forEach(key => {
            if (errors[key] && key !== 'general') {
                errorMessages.push(errors[key]);
            }
        });
        return errorMessages;
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
                    <button className={styles.modalCloseButton} onClick={handleClose} disabled={isLoading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="category_name">
                            Category Name * 
                            <span className={styles.hint}>(more than 3 characters)</span>
                        </label>
                        <input
                            type="text"
                            id="category_name"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            placeholder="Enter category name"
                            className={errors.category_name ? styles.errorInput : ''}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">
                            Description * 
                            <span className={styles.hint}>(10-50 characters)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter category description"
                            className={errors.description ? styles.errorInput : ''}
                            disabled={isLoading}
                            rows="3"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Category Image 
                            <span className={styles.hint}>(optional, max 1 image, 5MB)</span>
                        </label>
                        <div className={styles.imageUploadSection}>
                            {imagePreview ? (
                                <div className={styles.imagePreviewContainer}>
                                    <img 
                                        src={imagePreview.startsWith('blob:') ? imagePreview : getAbsoluteImageUrl(imagePreview)}
                                        alt="Category preview" 
                                        className={styles.imagePreview}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className={styles.removeImageButton}
                                        disabled={isLoading}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.imageUploadPlaceholder}>
                                    <input
                                        type="file"
                                        id="category-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="category-image" className={styles.fileInputLabel}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="17 8 12 3 7 8"/>
                                            <line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span>Click to upload image</span>
                                        <span className={styles.fileInputHint}>PNG, JPG, WebP, GIF (max. 5MB)</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Display all form errors below inputs */}
                    {getAllErrors().length > 0 && (
                        <div className={styles.formErrors}>
                            {getAllErrors().map((error, index) => (
                                <div key={index} className={styles.errorItem}>
                                    {error}
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.general && (
                        <div className={styles.generalError}>
                            {errors.general}
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isLoading}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className={`${styles.saveButton} ${!isFormValid() ? styles.disabled : ''}`}
                            disabled={!isFormValid()}
                        >
                            {isLoading ? (
                                <>
                                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Category' : 'Add Category'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;

