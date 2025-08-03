import React, { useState, useEffect } from 'react';
import { validateCategoryForm } from '../../utils/validators';
import styles from './categoryModal.module.css';

const CategoryModal = ({ onSave, onClose, isLoading = false }) => {
    const [formData, setFormData] = useState({
        category_name: '',
        description: ''
    });
    const [errors, setErrors] = useState({});

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
            await onSave(formData);
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
        // Simple check - just ensure category name is not empty and not loading
        return formData.category_name.trim().length > 0 && !isLoading;
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
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Add New Category</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isLoading}
                        aria-label="Close modal"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="category_name">Category Name *</label>
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
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter category description (optional)"
                            className={errors.description ? styles.errorInput : ''}
                            disabled={isLoading}
                            rows="3"
                        />
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
                        <button 
                            type="button" 
                            className={styles.cancelButton}
                            onClick={handleClose}
                            disabled={isLoading}
                        >
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
                                    Adding...
                                </>
                            ) : (
                                'Add Category'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal; 