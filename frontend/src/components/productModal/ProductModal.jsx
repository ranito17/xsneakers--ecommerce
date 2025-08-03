    // frontend/src/components/ProductModal/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import styles from './productModal.module.css';
import { validateProductForm} from '../../utils/validators';

const ProductModal = ({ product, categories = [], onSave, onClose, isNewProduct, onDelete }) => {
    console.log('ProductModal categories:', categories);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category_id: '',
        stock_quantity: 0,
        color: '',
        sizes: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Update form data when product prop changes
    useEffect(() => {
        if (product && !isNewProduct) {
            // Format sizes array back to string for display
            const formatSizesForDisplay = (sizes) => {
                if (!sizes) return '';
                
                // If it's already an array, join it
                if (Array.isArray(sizes)) {
                    return sizes.join(',');
                }
                
                // If it's a string that looks like an array, parse it
                if (typeof sizes === 'string') {
                    try {
                        // Remove brackets and quotes, then split by comma
                        const cleanSizes = sizes.replace(/[\[\]"]/g, '').split(',');
                        return cleanSizes.join(',');
                    } catch (error) {
                        return sizes;
                    }
                }
                
                return sizes;
            };

            setFormData({
                name: product.name || '',
                price: product.price || '',
                description: product.description || '',
                category_id: product.category_id || '',
                stock_quantity: product.stock_quantity || 0,
                color: product.color || '',
                sizes: formatSizesForDisplay(product.sizes)
            });
        } else {
            // Reset form for new product
            setFormData({
                name: '',
                price: '',
                description: '',
                category_id: '',
                stock_quantity: 0,
                color: '',
                sizes: ''
            });
        }
        setErrors({});
    }, [product, isNewProduct]);

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
        const validation = validateProductForm(formData, categories);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            // Format sizes as array if provided
            const formatSizes = (sizesString) => {
                if (!sizesString || !sizesString.trim()) return null;
                return sizesString.split(',').map(size => parseFloat(size.trim())).filter(size => !isNaN(size));
            };

            if (isNewProduct) {
                // Create new product
                const newProduct = {
                    ...formData,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock_quantity),
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    sizes: formatSizes(formData.sizes)
                };
                await onSave(newProduct);
            } else {
                // Update existing product
                const updatedProduct = {
                    id: product.id,
                    ...formData,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock_quantity),
                    category_id: formData.category_id ? parseInt(formData.category_id) : null,
                    sizes: formatSizes(formData.sizes)
                };
                await onSave(updatedProduct);
            }
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            setErrors({ general: `Failed to ${isNewProduct ? 'create' : 'update'} product. Please try again.` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };



    // Get all error messages to display below form
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
                    <h2>{isNewProduct ? 'Add Product' : 'Edit Product'}</h2>
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
                        <label htmlFor="name">Product Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            className={errors.name ? styles.errorInput : ''}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price">Price *</label>
                        <div className={styles.priceInput}>
                            <span className={styles.currency}>$</span>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={errors.price ? styles.errorInput : ''}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            className={errors.description ? styles.errorInput : ''}
                            disabled={isLoading}
                        />
                    </div>



                    <div className={styles.formGroup}>
                        <label htmlFor="category_id">Category</label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className={errors.category_id ? styles.errorInput : ''}
                            disabled={isLoading || categories.length === 0}
                        >
                            <option value="">
                                {categories.length === 0 ? 'Loading categories...' : 'Select a category'}
                            </option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="stock_quantity">Stock Quantity</label>
                        <input
                            type="number"
                            id="stock_quantity"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            className={errors.stock_quantity ? styles.errorInput : ''}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="color">Color</label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Enter color (optional)"
                            className={errors.color ? styles.errorInput : ''}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="sizes">Sizes</label>
                        <small style={{ color: '#666', fontSize: '0.8rem', marginBottom: '8px', display: 'block' }}>
                            Enter sizes as numbers separated by commas (e.g., 36, 38, 40, 42)
                        </small>
                        <input
                            type="text"
                            id="sizes"
                            name="sizes"
                            value={formData.sizes}
                            onChange={handleChange}
                            placeholder="36, 38, 40, 42 (optional)"
                            className={errors.sizes ? styles.errorInput : ''}
                            disabled={isLoading}
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
                        
                        {!isNewProduct && (
                            <button 
                                type="button" 
                                className={styles.deleteButton}
                                onClick={onDelete}
                                disabled={isLoading}
                            >
                                Delete
                            </button>
                        )}
                        
                        <button 
                            type="submit" 
                            className={styles.saveButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                        </circle>
                                    </svg>
                                    {isNewProduct ? 'Adding...' : 'Saving...'}
                                </>
                            ) : (
                                isNewProduct ? 'Add Product' : 'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;