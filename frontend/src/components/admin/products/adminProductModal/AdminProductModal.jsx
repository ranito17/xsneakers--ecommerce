// frontend/src/components/ProductModal/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../../../context/SettingsProvider';
import styles from './adminProductModal.module.css';
import { validateProductForm, convertLegacySizesToNewFormat, calculateTotalStock } from '../../../../utils/product.utils';
import { formatPrice } from '../../../../utils/price.utils';

const  AdminProductModal = ({ 
    product, 
    categories = [], 
    onSave, 
    onClose, 
    isNewProduct, 
    viewMode = false, // View mode for dashboard, edit mode for products page
    onOpenSizesModal, // Handler to open sizes modal
    onOpenImagesModal, // Handler to open images modal
    // Settings for pricing display (fallback if settings context not available)
    currency: currencyProp,
    taxRate: taxRateProp,
    defaultDeliveryCost: defaultDeliveryCostProp,
    freeDeliveryThreshold: freeDeliveryThresholdProp
}) => {
    // Get settings from context, with fallback to props
    const { settings } = useSettings();
    const currency = settings?.currency || currencyProp || 'ILS';
    const taxRate = settings?.tax_rate || taxRateProp || 0;
    const defaultDeliveryCost = settings?.default_delivery_cost || defaultDeliveryCostProp || 0;
    const freeDeliveryThreshold = settings?.free_delivery_threshold || freeDeliveryThresholdProp || 0;
    const isEditing = !viewMode; // If not in view mode, we're editing
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category_id: '',
        sizes: [],
        is_active: 1
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [originalSizes, setOriginalSizes] = useState([]); // Track original sizes to prevent changes

    // Update form data when product prop changes
    useEffect(() => {
        if (product && !isNewProduct) {
            // Handle both legacy and new size formats
            let sizes = [];
            if (product.sizes) {
                if (Array.isArray(product.sizes)) {
                    // New format - already array of objects
                    sizes = product.sizes;
                } else if (typeof product.sizes === 'string') {
                    // Legacy format - convert to new format
                    sizes = convertLegacySizesToNewFormat(product.sizes, product.stock_quantity || 0);
                }
            }

            // Store original sizes for validation
            setOriginalSizes(sizes.map(s => ({ size: s.size, quantity: s.quantity })));

            setFormData({
                name: product.name || '',
                price: product.price || '',
                description: product.description || '',
                category_id: product.category_id || '',
                sizes: sizes,
                is_active: product.is_active !== undefined ? product.is_active : 1
            });
        } else {
            // Reset form for new product
            setOriginalSizes([]);
            setFormData({
                name: '',
                price: '',
                description: '',
                category_id: '',
                sizes: [],
                is_active: 1 // New products are active by default
            });
        }
        setErrors({});
    }, [product, isNewProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'is_active' ? parseInt(value) : value
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
        
        // Validate form with original sizes to prevent changing existing sizes
        const validation = validateProductForm(formData, categories, originalSizes);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                sizes: formData.sizes.filter(sizeObj => sizeObj.size && sizeObj.quantity !== undefined),
                is_active: formData.is_active !== undefined ? formData.is_active : 1
            };

            if (isNewProduct) {
                await onSave(productData);
            } else {
                await onSave({
                    id: product.id,
                    ...productData
                });
            }
            // Close modal after successful save
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            // Check if error message contains duplicate name info
            const errorMessage = error.message || `Failed to ${isNewProduct ? 'create' : 'update'} product. Please try again.`;
            if (errorMessage.toLowerCase().includes('name already exists')) {
                setErrors({ name: errorMessage });
            } else {
                setErrors({ general: errorMessage });
            }
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
    
    // Calculate total stock for display
    const totalStock = calculateTotalStock(formData.sizes || product?.sizes, product?.stock_quantity || 0);
    
    // Get category name helper
    const getCategoryName = (categoryId) => {
        if (!categoryId) return 'Uncategorized';
        const category = categories.find(c => c.category_id == categoryId);
        return category?.category_name || product?.category_name || 'Uncategorized';
    };
    
    // Calculate pricing information
    const basePrice = parseFloat(product?.price || formData.price || 0);
    const taxAmount = basePrice * (taxRate / 100);
    const priceWithTax = basePrice + taxAmount;
    const deliveryCost = basePrice >= freeDeliveryThreshold ? 0 : defaultDeliveryCost;
    const totalPrice = priceWithTax + deliveryCost;
    
    // Format currency using utility function
    const formatCurrency = (amount) => {
        return formatPrice(amount, currency);
    };

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>
                        {isNewProduct ? 'Add New Product' : 
                         viewMode ? `Product Details - ${product?.name}` : 
                         `Edit ${product?.name || 'Product'}`}
                    </h2>
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
                    {/* View Mode */}
                    {!isEditing && !isNewProduct && product && (
                        <div className={styles.viewModeContainer}>
                            <div className={styles.viewSection}>
                                <h3>Basic Information</h3>
                                <div className={styles.viewGrid}>
                                    <div className={styles.viewItem}>
                                        <label>Name:</label>
                                        <span>{product.name}</span>
                                    </div>
                                    <div className={styles.viewItem}>
                                        <label>Category:</label>
                                        <span>{getCategoryName(product.category_id)}</span>
                                    </div>
                                    <div className={styles.viewItem}>
                                        <label>Price:</label>
                                        <span>{formatCurrency(product.price)}</span>
                                    </div>
                                    <div className={styles.viewItem}>
                                        <label>Total Stock:</label>
                                        <span>{totalStock} units</span>
                                    </div>
                                    <div className={styles.viewItem}>
                                        <label>Units Sold:</label>
                                        <span>{product.total_quantity_sold || 0}</span>
                                    </div>
                                    <div className={styles.viewItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Description:</label>
                                        <p>{product.description || 'No description'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            <div className={styles.viewSection}>
                                <h3>Pricing & Delivery</h3>
                                <div className={styles.pricingGrid}>
                                    <div className={styles.pricingItem}>
                                        <label>Base Price:</label>
                                        <span>{formatCurrency(basePrice)}</span>
                                    </div>
                                    <div className={styles.pricingItem}>
                                        <label>Tax ({taxRate}%):</label>
                                        <span>{formatCurrency(taxAmount)}</span>
                                    </div>
                                    <div className={styles.pricingItem}>
                                        <label>Price with Tax:</label>
                                        <span>{formatCurrency(priceWithTax)}</span>
                                    </div>
                                    <div className={styles.pricingItem}>
                                        <label>Delivery Cost:</label>
                                        <span>{deliveryCost === 0 ? 'Free' : formatCurrency(deliveryCost)}</span>
                                    </div>
                                    <div className={styles.pricingItem} style={{ gridColumn: '1 / -1' }}>
                                        <label>Total Customer Pays:</label>
                                        <span className={styles.totalPrice}>{formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Management Buttons */}
                            <div className={styles.viewSection}>
                                <h3>Manage Product</h3>
                                <div className={styles.managementButtons}>
                                    <button
                                        type="button"
                                        className={styles.manageBtn}
                                        onClick={() => onOpenSizesModal && onOpenSizesModal(product)}
                                    >
                                        📏 Manage Sizes & Stock
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.manageBtn}
                                        onClick={() => onOpenImagesModal && onOpenImagesModal(product)}
                                    >
                                        🖼️ Manage Images
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Mode */}
                    {(isEditing || isNewProduct) && (
                        <>
                    {/* Pricing Info Display (Read-only in Edit Mode) */}
                    {!isNewProduct && (
                        <div className={styles.pricingInfo}>
                            <h3>Pricing Summary (Read-only)</h3>
                            <div className={styles.pricingDisplay}>
                                <div className={styles.priceItem}>
                                    <label>Base Price:</label>
                                    <span>{formatCurrency(basePrice)}</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <label>Tax ({taxRate}%):</label>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <label>With Tax:</label>
                                    <span>{formatCurrency(priceWithTax)}</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <label>Delivery:</label>
                                    <span>{deliveryCost === 0 ? 'Free' : formatCurrency(deliveryCost)}</span>
                                </div>
                                <div className={styles.priceItem}>
                                    <label>Total:</label>
                                    <strong>{formatCurrency(totalPrice)}</strong>
                                </div>
                            </div>
                        </div>
                    )}

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
                            <span className={styles.currency}>{currency.length === 3 ? '' : (currency === 'ILS' ? '₪' : currency)}</span>
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
                        <label htmlFor="category_id">Category *</label>
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

                    {/* Product Status Section */}
                    {!isNewProduct && (
                        <div className={styles.statusSection}>
                            <h3 className={styles.sectionTitle}>Product Status</h3>
                            <div className={styles.formGroup}>
                                <label htmlFor="is_active">Status</label>
                                <select
                                    id="is_active"
                                    name="is_active"
                                    value={formData.is_active}
                                    onChange={handleChange}
                                    className={styles.statusSelect}
                                    disabled={isLoading}
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                                <p className={styles.statusHelpText}>
                                    {formData.is_active === 1 
                                        ? 'Active products can be purchased by customers.'
                                        : 'Inactive products are hidden from customers but sizes and stock are preserved.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Management buttons for sizes and images */}
                    {!isNewProduct && (
                        <div className={styles.managementSection}>
                            <h3 className={styles.sectionTitle}>Quick Actions</h3>
                            <div className={styles.managementButtons}>
                                <button
                                    type="button"
                                    className={styles.manageBtn}
                                    onClick={() => onOpenSizesModal && onOpenSizesModal(product)}
                                    disabled={isLoading}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 7h16M4 12h16M4 17h16"/>
                                    </svg>
                                    Manage Sizes & Stock
                                </button>
                                <button
                                    type="button"
                                    className={styles.manageBtn}
                                    onClick={() => onOpenImagesModal && onOpenImagesModal(product)}
                                    disabled={isLoading}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <path d="M21 15l-5-5L5 21"/>
                                    </svg>
                                    Manage Images
                                </button>
                            </div>
                        </div>
                    )}

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
                            {viewMode && !isEditing ? 'Close' : 'Cancel'}
                        </button>
                        
                        
                        {(isEditing || isNewProduct) && (
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
                        )}
                    </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminProductModal;