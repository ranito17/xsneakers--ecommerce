/**
 * Form Validation Utilities
 * 
 * General form validation functions for login, signup, contact, and other forms.
 * Centralized validation logic for consistent error messaging.
 */

import { validateName, validateEmail, validatePhone, validateZipcode } from './user.utils';

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

const REGEX_PATTERNS = {
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/  // At least 6 chars, must have letters AND numbers
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be longer than 5 characters' };
    }
    if (!/[A-Za-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one letter' };
    }
    if (!/\d/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!REGEX_PATTERNS.PASSWORD.test(password)) {
        return { 
            isValid: false, 
            message: 'Password must be at least 6 characters with letters and numbers' 
        };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: false, message: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
};

// ============================================================================
// LOGIN FORM VALIDATION
// ============================================================================

/**
 * Validate login form (minimal validation - just check if fields are filled)
 * @param {Object} formData - { email, password }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
    const errors = {};
    
    // Just check that fields are not empty - backend will handle actual validation
    if (!formData.email || !formData.email.trim()) {
        errors.email = 'Email is required';
    }
    
    if (!formData.password || !formData.password.trim()) {
        errors.password = 'Password is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

// ============================================================================
// SIGNUP FORM VALIDATION
// ============================================================================

/**
 * Validate signup form (full validation with address required)
 * @param {Object} formData - { full_name, email, password, confirmPassword, phone_number, street, city, house_number }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateSignupForm = (formData) => {
    const errors = {};
    
    // Validate full name
    const nameValidation = validateName(formData.full_name);
    if (!nameValidation.isValid) {
        errors.full_name = nameValidation.message;
    }
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
    }
    
    // Validate confirm password
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.message;
    }
    
    // Validate phone number (OPTIONAL - only validate format if provided)
    if (formData.phone_number && formData.phone_number.trim()) {
        const phoneValidation = validatePhone(formData.phone_number);
        if (!phoneValidation.isValid) {
            errors.phone_number = phoneValidation.message;
        }
    }
    
    // Validate address components (ALL OPTIONAL - only validate format if provided)
    // If any address field is provided, validate all required address fields
    const hasAnyAddressField = formData.street?.trim() || formData.city?.trim() || 
                                formData.house_number?.trim() || formData.zipcode?.trim();
    
    if (hasAnyAddressField) {
        // If user starts filling address, validate all fields
        if (!formData.street || !formData.street.trim()) {
            errors.street = 'Street is required when providing address';
        }
        
        if (!formData.city || !formData.city.trim()) {
            errors.city = 'City is required when providing address';
        }
        
        if (!formData.house_number || !formData.house_number.trim()) {
            errors.house_number = 'House number is required when providing address';
        }
        
        if (!formData.zipcode || !formData.zipcode.trim()) {
            errors.zipcode = 'Zip code is required when providing address';
        } else {
            const zipcodeValidation = validateZipcode(formData.zipcode);
            if (!zipcodeValidation.isValid) {
                errors.zipcode = zipcodeValidation.message;
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

// ============================================================================
// CONTACT FORM VALIDATION
// ============================================================================

/**
 * Validate contact form subject
 * @param {string} subject - Subject to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateSubject = (subject) => {
    if (!subject || !subject.trim()) {
        return { isValid: false, message: 'Subject is required' };
    }
    if (subject.trim().length < 6) {
        return { isValid: false, message: 'Subject must be at least 6 characters long' };
    }
    if (subject.trim().length > 200) {
        return { isValid: false, message: 'Subject must be less than 200 characters' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate contact form message
 * @param {string} message - Message to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateMessage = (message) => {
    if (!message || !message.trim()) {
        return { isValid: false, message: 'Message is required' };
    }
    if (message.trim().length < 10) {
        return { isValid: false, message: 'Message must be at least 10 characters long' };
    }
    if (message.trim().length > 150) {
        return { isValid: false, message: 'Message must be less than 150 characters' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate complete contact form
 * @param {Object} formData - { name, email, subject, message }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateContactForm = (formData) => {
    const errors = {};
    
    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
        errors.name = nameValidation.message;
    }
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.message;
    }
    
    // Validate subject
    const subjectValidation = validateSubject(formData.subject);
    if (!subjectValidation.isValid) {
        errors.subject = subjectValidation.message;
    }
    
    // Validate message
    const messageValidation = validateMessage(formData.message);
    if (!messageValidation.isValid) {
        errors.message = messageValidation.message;
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

/**
 * Validate individual contact form field
 * @param {string} fieldName - Field name to validate
 * @param {string} value - Field value
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateContactField = (fieldName, value) => {
    switch (fieldName) {
        case 'name':
            return validateName(value);
        case 'email':
            return validateEmail(value);
        case 'subject':
            return validateSubject(value);
        case 'message':
            return validateMessage(value);
        default:
            return { isValid: true, message: '' };
    }
};

// ============================================================================
// CATEGORY FORM VALIDATION
// ============================================================================

/**
 * Validate category form
 * @param {Object} formData - { category_name, description }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateCategoryForm = (formData) => {
    const errors = {};
    
    // Validate category name - must be longer than 3 characters
    if (!formData.category_name || !formData.category_name.trim()) {
        errors.category_name = 'Category name is required';
    } else if (formData.category_name.trim().length <= 3) {
        errors.category_name = 'Category name must be longer than 3 characters';
    } else if (formData.category_name.trim().length > 50) {
        errors.category_name = 'Category name must be less than 50 characters';
    }
    
    // Validate description - between 10 and 250 characters
    if (!formData.description || !formData.description.trim()) {
        errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 250) {
        errors.description = 'Description must be less than 250 characters';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
};

// ============================================================================
// GENERIC FIELD VALIDATION
// ============================================================================

/**
 * Validate a single field with context
 * Used for real-time validation as user types
 * @param {string} fieldName - Name of the field to validate
 * @param {string} value - Value to validate
 * @param {Object} formData - Full form data for context (e.g., for password confirmation)
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateField = (fieldName, value, formData = {}) => {
    switch (fieldName) {
        case 'name':
        case 'full_name':
            return validateName(value);
        case 'email':
            return validateEmail(value);
        case 'password':
            return validatePassword(value);
        case 'confirmPassword':
            return validateConfirmPassword(formData.password, value);
        case 'phone_number':
            return validatePhone(value);
        case 'subject':
            return validateSubject(value);
        case 'message':
            return validateMessage(value);
        default:
            return { isValid: true, message: '' };
    }
};

// ============================================================================
// MESSAGE COMPOSER VALIDATION
// ============================================================================

/**
 * Validate message composer form (for admin messaging)
 * @param {Object} formData - { recipientEmail, recipientName, subject, message, messageType, priority }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateMessageComposerForm = (formData) => {
    const errors = {};
    
    // Validate recipient email
    const emailValidation = validateEmail(formData.recipientEmail);
    if (!emailValidation.isValid) {
        errors.recipientEmail = emailValidation.message;
    }
    
    // Validate recipient name (optional but if provided must be valid)
    if (formData.recipientName && formData.recipientName.trim()) {
        const nameValidation = validateName(formData.recipientName);
        if (!nameValidation.isValid) {
            errors.recipientName = nameValidation.message;
        }
    }
    
    // Validate subject
    const subjectValidation = validateSubject(formData.subject);
    if (!subjectValidation.isValid) {
        errors.subject = subjectValidation.message;
    }
    
    // Validate message
    const messageValidation = validateMessage(formData.message);
    if (!messageValidation.isValid) {
        errors.message = messageValidation.message;
    }
    
    // Validate message type (if provided)
    if (formData.messageType && !['admin_to_admin', 'admin_to_supplier', 'customer_inquiry'].includes(formData.messageType)) {
        errors.messageType = 'Invalid message type';
    }
    
    // Validate priority (if provided)
    if (formData.priority && !['urgent', 'high', 'normal', 'low'].includes(formData.priority)) {
        errors.priority = 'Invalid priority level';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============================================================================
// SETTINGS FORM VALIDATION
// ============================================================================

/**
 * Validate settings form
 * @param {Object} settings - Settings object to validate
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateSettingsForm = (settings) => {
    const errors = {};
    
    // Validate store name
    if (!settings.store_name || !settings.store_name.trim()) {
        errors.store_name = 'Store name is required';
    } else if (settings.store_name.trim().length < 2) {
        errors.store_name = 'Store name must be at least 2 characters';
    }
    
    // Validate supplier name (optional but if provided must be valid)
    if (settings.supplier_name && settings.supplier_name.trim().length < 2) {
        errors.supplier_name = 'Supplier name must be at least 2 characters';
    }
    
    // Validate supplier email (optional but if provided must be valid)
    if (settings.supplier_email && settings.supplier_email.trim()) {
        const emailValidation = validateEmail(settings.supplier_email);
        if (!emailValidation.isValid) {
            errors.supplier_email = emailValidation.message;
        }
    }
    
    // Validate tax rate (must be >= 0 and <= 10)
    if (settings.tax_rate !== undefined && settings.tax_rate !== null) {
        const taxRate = parseFloat(settings.tax_rate);
        if (isNaN(taxRate)) {
            errors.tax_rate = 'Tax rate must be a valid number';
        } else if (taxRate < 0) {
            errors.tax_rate = 'Tax rate must be 0 or above';
        } else if (taxRate > 10) {
            errors.tax_rate = 'Tax rate must be between 0 and 10 (e.g., 0.09 for 9%)';
        }
    }
    
    // Validate default delivery cost (must be >= 0)
    if (settings.default_delivery_cost !== undefined && settings.default_delivery_cost !== null) {
        const deliveryCost = parseFloat(settings.default_delivery_cost);
        if (isNaN(deliveryCost)) {
            errors.default_delivery_cost = 'Delivery cost must be a valid number';
        } else if (deliveryCost < 0) {
            errors.default_delivery_cost = 'Delivery cost must be 0 or above';
        }
    }
    
    // Validate free delivery threshold (must be >= 0)
    if (settings.free_delivery_threshold !== undefined && settings.free_delivery_threshold !== null) {
        const threshold = parseFloat(settings.free_delivery_threshold);
        if (isNaN(threshold)) {
            errors.free_delivery_threshold = 'Free delivery threshold must be a valid number';
        } else if (threshold < 0) {
            errors.free_delivery_threshold = 'Free delivery threshold must be 0 or above';
        }
    }
    
    // Validate low stock threshold (must be >= 0)
    if (settings.low_stock_threshold !== undefined && settings.low_stock_threshold !== null) {
        const threshold = parseInt(settings.low_stock_threshold);
        if (isNaN(threshold)) {
            errors.low_stock_threshold = 'Low stock threshold must be a valid number';
        } else if (threshold < 0) {
            errors.low_stock_threshold = 'Low stock threshold must be 0 or above';
        }
    }
    
    // Validate low stock threshold per size (must be >= 0)
    if (settings.low_stock_threshold_per_size !== undefined && settings.low_stock_threshold_per_size !== null) {
        const threshold = parseInt(settings.low_stock_threshold_per_size);
        if (isNaN(threshold)) {
            errors.low_stock_threshold_per_size = 'Low stock per size must be a valid number';
        } else if (threshold < 0) {
            errors.low_stock_threshold_per_size = 'Low stock per size must be 0 or above';
        }
    }
    
    // Validate best sellers limit (must be >= 0)
    if (settings.best_sellers_limit !== undefined && settings.best_sellers_limit !== null) {
        const limit = parseInt(settings.best_sellers_limit);
        if (isNaN(limit)) {
            errors.best_sellers_limit = 'Best sellers limit must be a valid number';
        } else if (limit < 0) {
            errors.best_sellers_limit = 'Best sellers limit must be 0 or above';
        }
    }
    
    // Validate homepage display limit (must be >= 0)
    if (settings.homepage_display_limit !== undefined && settings.homepage_display_limit !== null) {
        const limit = parseInt(settings.homepage_display_limit);
        if (isNaN(limit)) {
            errors.homepage_display_limit = 'Homepage display limit must be a valid number';
        } else if (limit < 0) {
            errors.homepage_display_limit = 'Homepage display limit must be 0 or above';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ============================================================================
// STOCK REFUEL REQUEST VALIDATION (from validators.js)
// ============================================================================

/**
 * Validate stock refuel request data
 * @param {Object} refuelData - { products: Array, notes: string }
 * @returns {Object} { isValid: boolean, errors: object }
 */
export const validateStockRefuelRequest = (refuelData) => {
    const errors = {};
    
    // Validate products array
    if (!refuelData.products || !Array.isArray(refuelData.products)) {
        errors.products = 'Products array is required';
        return { isValid: false, errors };
    }
    
    if (refuelData.products.length === 0) {
        errors.products = 'At least one product must be selected';
        return { isValid: false, errors };
    }
    
    // Validate each product
    let hasValidQuantities = false;
    const productErrors = [];
    
    refuelData.products.forEach((product, index) => {
        const productError = {};
        
        // Validate product basic info
        if (!product.id) {
            productError.id = 'Product ID is required';
        }
        
        if (!product.name || !product.name.trim()) {
            productError.name = 'Product name is required';
        }
        
        // Validate size quantities
        if (product.sizeQuantities && Array.isArray(product.sizeQuantities)) {
            let productHasQuantities = false;
            const sizeErrors = [];
            
            product.sizeQuantities.forEach((sizeQty, sizeIndex) => {
                const sizeError = {};
                
                // Validate size
                if (sizeQty.size === undefined || sizeQty.size === null) {
                    sizeError.size = 'Size is required';
                } else if (typeof sizeQty.size !== 'number' && typeof sizeQty.size !== 'string') {
                    sizeError.size = 'Size must be a number or string';
                }
                
                // Validate quantity
                if (sizeQty.quantity === undefined || sizeQty.quantity === null) {
                    sizeError.quantity = 'Quantity is required';
                } else if (typeof sizeQty.quantity !== 'number') {
                    sizeError.quantity = 'Quantity must be a number';
                } else if (sizeQty.quantity < 0) {
                    sizeError.quantity = 'Quantity cannot be negative';
                } else if (sizeQty.quantity > 1000) {
                    sizeError.quantity = 'Quantity cannot exceed 1000';
                } else if (sizeQty.quantity > 0) {
                    productHasQuantities = true;
                }
                
                if (Object.keys(sizeError).length > 0) {
                    sizeErrors.push(`Size ${sizeQty.size}: ${Object.values(sizeError).join(', ')}`);
                }
            });
            
            if (sizeErrors.length > 0) {
                productError.sizeQuantities = sizeErrors.join('; ');
            }
            
            if (productHasQuantities) {
                hasValidQuantities = true;
            }
        } else {
            // Fallback for legacy quantity field
            if (product.quantity !== undefined && product.quantity !== null) {
                if (typeof product.quantity !== 'number') {
                    productError.quantity = 'Quantity must be a number';
                } else if (product.quantity < 0) {
                    productError.quantity = 'Quantity cannot be negative';
                } else if (product.quantity > 1000) {
                    productError.quantity = 'Quantity cannot exceed 1000';
                } else if (product.quantity > 0) {
                    hasValidQuantities = true;
                }
            } else {
                productError.quantity = 'Quantity is required';
            }
        }
        
        if (Object.keys(productError).length > 0) {
            productErrors.push({
                index,
                productName: product.name || `Product ${index + 1}`,
                errors: productError
            });
        }
    });
    
    if (productErrors.length > 0) {
        errors.productDetails = productErrors;
    }
    
    if (!hasValidQuantities) {
        errors.quantities = 'At least one product must have quantities greater than 0';
    }
    
    // Validate notes (optional)
    if (refuelData.notes !== undefined && refuelData.notes !== null) {
        if (typeof refuelData.notes !== 'string') {
            errors.notes = 'Notes must be a string';
        } else if (refuelData.notes.trim().length > 1000) {
            errors.notes = 'Notes cannot exceed 1000 characters';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

